class RunWebhook < ActiveJob::Base
  queue_as :webhooks

  WEBHOOK_REQUEST_TIMEOUT_SECONDS = 10
  HTTP_METHODS = {
    'http_post' => :post,
    'http_put' => :put,
    'http_patch' => :patch,
    'http_delete' => :delete,
  }.freeze

  # entities is a hash with entity_name as key and entity_id as value (entity_name will be mapped to an ActiveRecord class)
  def perform(webhook_id:, current_tenant_id:, is_test: false, entities: {})
    Current.tenant = Tenant.find(current_tenant_id)

    logger.info { "[#{Current.tenant.subdomain}] Performing RunWebhook ActiveJob for webhook ID #{webhook_id}" }

    # Find webhook from DB
    webhook = Webhook.find(webhook_id)

    # Skip if webhook is disabled and is not a test
    return if !is_test && !webhook.is_enabled

    # Load entities from DB
    loaded_entities = {}
    entities.each do |entity_name, entity_id|
      entity_class = map_entity_name_to_class(entity_name)

      # If there is an ActiveRecord class for that entity_name, load it from DB
      # Otherwise, just pass the ID (this is the special case of trigger 'delete_post')
      if entity_class
        loaded_entities[entity_name] = entity_class.find(entity_id)
      else
        loaded_entities[entity_name] = entity_id
      end
    end

    # Build context based on webhook's trigger
    context = CreateLiquidTemplateContextWorkflow.new(
      webhook_trigger: webhook.trigger,
      is_test: is_test,
      entities: loaded_entities,
    ).run

    # Render and validate the URL immediately before making the request. The URL can
    # contain Liquid variables, so validating only when the webhook is saved is not enough.
    url = Liquid::Template.parse(webhook.url).render(context)
    WebhookTargetValidator.validate!(url)

    # Render the optional JSON body.
    if webhook.http_body.present?
      rendered_http_body = Liquid::Template.parse(webhook.http_body).render(context)
      http_body = JSON.parse(rendered_http_body).to_json
    else
      http_body = nil
    end

    http_headers = normalize_http_headers(webhook.http_headers)

    # Redirects are disabled because a public URL could otherwise redirect the server
    # to a private or link-local address after the initial target validation.
    HTTParty.public_send(
      map_webhook_http_method(webhook.http_method),
      url,
      {
        body: http_body,
        headers: http_headers,
        timeout: WEBHOOK_REQUEST_TIMEOUT_SECONDS,
        no_follow: true,
      }
    )
  end

  private

    def map_webhook_http_method(http_method)
      HTTP_METHODS.fetch(http_method.to_s) do
        raise ArgumentError, "Unsupported webhook HTTP method: #{http_method.inspect}"
      end
    end

    def normalize_http_headers(http_headers)
      return {} if http_headers.blank?

      parsed_headers = http_headers.is_a?(String) ? JSON.parse(http_headers) : http_headers
      unless parsed_headers.is_a?(Array)
        raise ArgumentError, 'Webhook HTTP headers must be an array'
      end

      parsed_headers.each_with_object({}) do |header, memo|
        unless header.respond_to?(:[])
          raise ArgumentError, 'Each webhook HTTP header must contain a key and value'
        end

        key = header['key'] || header[:key]
        value = header['value'] || header[:value]

        next if key.blank? && value.blank?
        if key.blank? || value.blank?
          raise ArgumentError, 'Each webhook HTTP header must contain a key and value'
        end

        memo[key.to_s] = value.to_s
      end
    end

    def map_entity_name_to_class(entity_name)
      case entity_name
      when :post
        Post
      when :user, :post_author, :comment_author, :vote_author
        User
      when :board
        Board
      when :post_status
        PostStatus
      when :comment
        Comment
      else
        nil
      end
    end
end

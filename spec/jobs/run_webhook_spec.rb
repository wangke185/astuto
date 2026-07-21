require 'rails_helper'

RSpec.describe RunWebhook, type: :job do
  let(:tenant) { instance_double(Tenant, id: 1, subdomain: 'demo') }
  let(:template_context_workflow) do
    instance_double(CreateLiquidTemplateContextWorkflow, run: {})
  end

  before do
    allow(Tenant).to receive(:find).with(1).and_return(tenant)
    allow(CreateLiquidTemplateContextWorkflow).to receive(:new).and_return(template_context_workflow)
    allow(WebhookTargetValidator).to receive(:validate!).and_return(true)
  end

  after do
    Current.reset
  end

  it 'uses the configured HTTP method and supports decrypted array headers' do
    webhook = instance_double(
      Webhook,
      is_enabled: true,
      trigger: 'new_post',
      url: 'https://example.com/webhooks',
      http_body: '{"event":"created"}',
      http_headers: [{ 'key' => 'Authorization', 'value' => 'Bearer test-token' }],
      http_method: 'http_put'
    )
    allow(Webhook).to receive(:find).with(7).and_return(webhook)

    expect(HTTParty).to receive(:put).with(
      'https://example.com/webhooks',
      hash_including(
        body: '{"event":"created"}',
        headers: { 'Authorization' => 'Bearer test-token' },
        timeout: 10,
        no_follow: true
      )
    )

    described_class.perform_now(
      webhook_id: 7,
      current_tenant_id: 1,
      is_test: true
    )
  end

  it 'maps every supported stored method without silently falling back to POST' do
    job = described_class.new

    expect(job.send(:map_webhook_http_method, 'http_post')).to eq(:post)
    expect(job.send(:map_webhook_http_method, 'http_put')).to eq(:put)
    expect(job.send(:map_webhook_http_method, 'http_patch')).to eq(:patch)
    expect(job.send(:map_webhook_http_method, 'http_delete')).to eq(:delete)

    expect {
      job.send(:map_webhook_http_method, 'unknown')
    }.to raise_error(ArgumentError, /Unsupported webhook HTTP method/)
  end

  it 'normalizes both JSON strings and decrypted arrays of headers' do
    job = described_class.new
    expected_headers = { 'X-Webhook-Token' => 'secret' }

    expect(
      job.send(:normalize_http_headers, '[{"key":"X-Webhook-Token","value":"secret"}]')
    ).to eq(expected_headers)

    expect(
      job.send(:normalize_http_headers, [{ 'key' => 'X-Webhook-Token', 'value' => 'secret' }])
    ).to eq(expected_headers)
  end
end

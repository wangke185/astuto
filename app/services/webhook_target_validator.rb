require 'ipaddr'
require 'resolv'
require 'uri'

class WebhookTargetValidator
  class InvalidTargetError < StandardError; end

  BLOCKED_NETWORKS = [
    IPAddr.new('0.0.0.0/8'),
    IPAddr.new('10.0.0.0/8'),
    IPAddr.new('100.64.0.0/10'),
    IPAddr.new('127.0.0.0/8'),
    IPAddr.new('169.254.0.0/16'),
    IPAddr.new('172.16.0.0/12'),
    IPAddr.new('192.0.0.0/24'),
    IPAddr.new('192.168.0.0/16'),
    IPAddr.new('198.18.0.0/15'),
    IPAddr.new('224.0.0.0/4'),
    IPAddr.new('240.0.0.0/4'),
    IPAddr.new('::/128'),
    IPAddr.new('::1/128'),
    IPAddr.new('::ffff:0:0/96'),
    IPAddr.new('fc00::/7'),
    IPAddr.new('fe80::/10'),
    IPAddr.new('ff00::/8'),
  ].freeze

  def self.validate!(url)
    uri = URI.parse(url)

    unless uri.is_a?(URI::HTTP) && uri.host.present?
      raise InvalidTargetError, 'Webhook URL must use HTTP or HTTPS and include a host'
    end

    if uri.userinfo.present?
      raise InvalidTargetError, 'Webhook URL must not contain embedded credentials'
    end

    addresses = Resolv.getaddresses(uri.host)
    if addresses.empty?
      raise InvalidTargetError, 'Webhook target host could not be resolved'
    end

    blocked_address = addresses.find { |address| blocked_address?(address) }
    if blocked_address
      raise InvalidTargetError, "Webhook target resolves to a blocked network address: #{blocked_address}"
    end

    uri
  rescue URI::InvalidURIError, Resolv::ResolvError => e
    raise InvalidTargetError, "Invalid webhook target: #{e.message}"
  end

  def self.blocked_address?(address)
    ip_address = IPAddr.new(address)
    BLOCKED_NETWORKS.any? { |network| network.include?(ip_address) }
  rescue IPAddr::InvalidAddressError
    true
  end
  private_class_method :blocked_address?
end

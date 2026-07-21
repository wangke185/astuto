require 'rails_helper'

RSpec.describe WebhookTargetValidator do
  describe '.validate!' do
    it 'accepts a public HTTP target' do
      allow(Resolv).to receive(:getaddresses).with('example.com').and_return(['93.184.216.34'])

      uri = described_class.validate!('https://example.com/webhooks')

      expect(uri.host).to eq('example.com')
    end

    it 'rejects loopback addresses' do
      allow(Resolv).to receive(:getaddresses).with('localhost').and_return(['127.0.0.1'])

      expect {
        described_class.validate!('http://localhost/webhooks')
      }.to raise_error(WebhookTargetValidator::InvalidTargetError, /blocked network address/)
    end

    it 'rejects hosts that resolve to private addresses' do
      allow(Resolv).to receive(:getaddresses).with('internal.example').and_return(['10.1.2.3'])

      expect {
        described_class.validate!('https://internal.example/webhooks')
      }.to raise_error(WebhookTargetValidator::InvalidTargetError, /blocked network address/)
    end

    it 'rejects link-local metadata addresses' do
      allow(Resolv).to receive(:getaddresses).with('169.254.169.254').and_return(['169.254.169.254'])

      expect {
        described_class.validate!('http://169.254.169.254/latest/meta-data')
      }.to raise_error(WebhookTargetValidator::InvalidTargetError, /blocked network address/)
    end

    it 'rejects non-HTTP schemes' do
      expect {
        described_class.validate!('file:///etc/passwd')
      }.to raise_error(WebhookTargetValidator::InvalidTargetError, /HTTP or HTTPS/)
    end

    it 'rejects embedded credentials' do
      allow(Resolv).to receive(:getaddresses).with('example.com').and_return(['93.184.216.34'])

      expect {
        described_class.validate!('https://user:password@example.com/webhooks')
      }.to raise_error(WebhookTargetValidator::InvalidTargetError, /embedded credentials/)
    end
  end
end

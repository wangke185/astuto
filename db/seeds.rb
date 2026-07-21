require 'securerandom'

# Create tenant
tenant = Tenant.create(
  site_name: 'Default Site Name',
  subdomain: 'default',
  status: 'active'
)
Current.tenant = tenant

# Create an owner account and confirm its email automatically. A password can be
# supplied explicitly for automated deployments; otherwise a unique password is
# generated for this installation and printed once during the seed process.
owner_email = ENV.fetch('DEFAULT_ADMIN_EMAIL', 'admin@example.com')
owner_password = ENV['DEFAULT_ADMIN_PASSWORD'].presence || SecureRandom.base64(24)
password_was_generated = ENV['DEFAULT_ADMIN_PASSWORD'].blank?

owner = User.create(
  full_name: 'Admin',
  email: owner_email,
  password: owner_password,
  role: 'owner',
  confirmed_at: Time.zone.now
)

tenant.tenant_billing = TenantBilling.create!(status: 'perpetual')

CreateWelcomeEntitiesWorkflow.new().run

# Let the user know how to log in with the owner account.
puts "A default tenant has been created with name #{tenant.site_name}"
puts 'A default owner account has been created. Credentials:'
puts "-> email: #{owner.email}"
puts "-> password: #{owner_password}"
puts 'The password above was generated for this installation. Store it securely and change it after signing in.' if password_was_generated

import convict from 'convict'

// Define a schema
const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['prod', 'demo', 'dev'],
    default: process.env.NODE_ENV,
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: process.env.PORT,
    env: 'PORT'
  },
  baseUrl: {
    doc: 'Base URL to run',
    format: 'String',
    default: process.env.BASE_URL,
    env: 'BASE_URL'
  },
  db: {
    doc: 'MongoDB connection URL',
    format: 'String',
    default: process.env.MONGO_URI,
    env: 'MONGO_URI'
  },
  jwt_secret_key: {
    doc: 'Jwt secret key for token authentication',
    format: 'String',
    default: process.env.JWT_SECRET_KEY,
    env: 'JWT_SECRET_KEY'
  },
  jwt_secret_key_expiry: {
    doc: 'Jwt secret key expiration value',
    format: 'String',
    default: process.env.JWT_SECRET_KEY_EXPIRY,
    env: 'JWT_SECRET_KEY_EXPIRY'
  },
  twilio_account_sid: {
    doc: 'Twilio account sid',
    format: 'String',
    default: process.env.TWILIO_ACCOUNT_SID,
    env: 'TWILIO_ACCOUNT_SID'
  },
  twilio_auth_token: {
    doc: 'Twilio authentication token',
    format: 'String',
    default: process.env.TWILIO_AUTH_TOKEN,
    env: 'TWILIO_AUTH_TOKEN'
  },
  twilio_phone_number: {
    doc: 'twilio phone number',
    format: 'String',
    default: process.env.TWILIO_PHONE_NUMBER,
    env: 'TWILIO_PHONE_NUMBER'
  },
  sms_verification_sid: {
    doc: 'SMS verification service sid',
    format: 'String',
    default: process.env.SMS_VERIFICATION_SID,
    env: 'SMS_VERIFICATION_SID'
  },
  sms_messaging_sid: {
    doc: 'SMS messaging service sid',
    format: 'String',
    default: process.env.SMS_MESSAGING_SERVICE_SID,
    env: 'SMS_MESSAGING_SERVICE_SID'
  },
  sendgrid_api_key: {
    doc: 'SendGrid API key for sending emails',
    format: 'String',
    default: process.env.SENDGRID_API_KEY,
    env: 'SENDGRID_API_KEY'
  },
  email_integration_sid: {
    doc: 'Email integration sid',
    format: 'String',
    default: process.env.EMAIL_INTEGRATION_SID,
    env: 'EMAIL_INTEGRATION_SID'
  },
  email_verification_sid: {
    doc: 'Email verification service sid',
    format: 'String',
    default: process.env.EMAIL_VERIFICATION_SID,
    env: 'EMAIL_VERIFICATION_SID'
  },
  email_password_reset_sid: {
    doc: 'Email password reset service sid',
    format: 'String',
    default: process.env.EMAIL_PASSWORD_RESET_SID,
    env: 'EMAIL_PASSWORD_RESET_SID'
  },
  aws_region: {
    doc: 'Aws region',
    format: 'String',
    default: process.env.AWS_REGION,
    env: 'AWS_REGION'
  },
  aws_access_key_id: {
    doc: 'Aws access key id',
    format: 'String',
    default: process.env.AWS_ACCESS_KEY_ID,
    env: 'AWS_ACCESS_KEY_ID'
  },
  aws_secret_access_key: {
    doc: 'Aws secret access key',
    format: 'String',
    default: process.env.AWS_SECRET_ACCESS_KEY,
    env: 'AWS_SECRET_ACCESS_KEY'
  },
  aws_bucket_name: {
    doc: 'Aws bucket name',
    format: 'String',
    default: process.env.AWS_BUCKET_NAME,
    env: 'AWS_BUCKET_NAME'
  }
})

// Perform validation
config.validate({ allowed: 'strict' })

export { config }

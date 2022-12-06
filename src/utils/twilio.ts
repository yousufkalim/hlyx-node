import Twilio from 'twilio'
import { config } from '../config/env.config.validations'

const twilioClient = Twilio(config.get('twilio_account_sid'), config.get('twilio_auth_token'))

export { twilioClient }

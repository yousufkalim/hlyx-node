import sgMail from '@sendgrid/mail'
import { config } from '../config/env.config.validations'

sgMail.setApiKey(config.get('sendgrid_api_key') as string)

export { sgMail }

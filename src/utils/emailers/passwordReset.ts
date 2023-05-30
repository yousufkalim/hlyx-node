import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { config } from '../../config/env.config.validations'
import { twilioClient } from '../twilio'

export const passwordResetEmailer = async (email: string, firstName: string, lastName: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('email_password_reset_sid') as string)
    .verifications.create({ to: email, channel: 'email', templateCustomSubstitutions: `{first_name: ${firstName}, last_name: ${lastName}}, email: ${email}` })
}

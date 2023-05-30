import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { config } from '../../config/env.config.validations'
import { twilioClient } from '../twilio'

export const verifyCodeEmailer = async (email: string, firstName: string, lastName: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('email_verification_sid') as string)
    .verifications.create({
      to: email,
      channel: 'email'
    })
}

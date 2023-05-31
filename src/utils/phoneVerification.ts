import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { config } from '../config/env.config.validations'
import { twilioClient } from './twilio'

// +1 for USA, will need to modify if we go global
export const sendCodeToPhone = async (phone: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('sms_verification_sid') as string)
    .verifications.create({ to: `+1${phone}`, channel: 'sms' })
}

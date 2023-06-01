import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message'
import { config } from '../config/env.config.validations'
import { twilioClient } from './twilio'

// +1 for USA, will need to modify if we go global
export const sendCodeToPhone = async (phone: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('sms_verification_sid') as string)
    .verifications.create({ to: `+1${phone}`, channel: 'sms' })
}

export const contactRequesterPhone = async (phone: string, receiverName: string, requesterName: string, cardUrl: string, mediaUrl: string): Promise<MessageInstance> => {
  return await twilioClient.messages.create({
    body: `Hello ${requesterName},\n
          We've successfully shared your contact information with ${receiverName}\n\n
          Here is Terrance's contact info:\n\n
          Profile Card\n
          ${cardUrl}\n\n
          Unlock all the benefits of HLYX, create your own profile today!`,
    messagingServiceSid: config.get('sms_messaging_sid') as string,
    mediaUrl,
    from: '+18668756944',
    to: `+1${phone}`
  })
}

export const contactRecieverPhone = async (phone: string, receiverName: string, requesterName: string, cardName: string, mediaUrl: string): Promise<MessageInstance> => {
  return await twilioClient.messages.create({
    body: `Hi ${receiverName},\n
          You have a new contact share!\n
          ${requesterName} has just shared contact information with you
          through your HYLX profile card "${cardName}".\n\n
          Sign in to view the details`,
    messagingServiceSid: config.get('sms_messaging_sid') as string,
    mediaUrl,
    to: `+1${phone}`
  })
}

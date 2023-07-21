import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message'
import { config } from '../config/env.config.validations'
import { twilioClient } from './twilio'
import { messages } from '../config/messages'

// +1 for USA, will need to modify if we go global
export const sendCodeToPhone = async (phone: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('sms_verification_sid') as string)
    .verifications.create({ to: `${phone}`, channel: 'sms' })
}

export const contactRequesterPhone = async (
  phone: string,
  receiverName: string,
  requesterName: string,
  cardUrl: string,
  mediaUrl: string | null
): Promise<MessageInstance | string> => {
  if (!phone) {
    throw Error(messages.SMS_ERROR)
  }
  try {
    return await twilioClient.messages.create({
      body: `Hello ${requesterName},\nWe've successfully shared your contact information with ${receiverName}\n\nHere is ${receiverName} contact info:\n\nProfile Card\n${cardUrl}\n\nUnlock all the benefits of HLYX, create your own profile today!`,
      messagingServiceSid: config.get('sms_messaging_sid') as string,
      mediaUrl: mediaUrl ?? '',
      from: '+18668756944',
      to: `${phone}`
    })
  } catch (err) {
    return 'Error'
  }
}

export const contactRecieverPhone = async (
  phone: string | null,
  receiverName: string,
  requesterName: string,
  cardName: string,
  mediaUrl?: string
): Promise<MessageInstance | string> => {
  if (!phone) {
    throw Error(messages.SMS_ERROR)
  }
  try {
    return await twilioClient.messages.create({
      body: `Hi ${receiverName},\nYou have a new contact share!\n\n${requesterName} has just shared contact information with you through your HYLX profile card "${cardName}".\n\nSign in to view the details`,
      messagingServiceSid: config.get('sms_messaging_sid') as string,
      mediaUrl,
      to: `${phone}`
    })
  } catch (err) {
    return 'Error'
  }
}

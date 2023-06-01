import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { config } from '../config/env.config.validations'
import { IUser, IEmail } from '../config/interfaces/common.interface'
import { messages } from '../config/messages'
import { twilioClient } from './twilio'

export const forgotPasswordEmailTemplate = (user: IUser, link: string): IEmail => {
  const msg: IEmail = {
    to: user.email,
    from: messages.SENDER_EMAIL,
    subject: 'Reset Password',
    text: 'Frontlinegig reset password link',
    html: `Hi <strong>${user.firstName}
    }!</strong><br> Here is Your Reset Password Link, Please Click: <strong><a href='${link}'>Here</a></strong> Which is only valid for 5 minutes`
  }

  return msg
}

export const sendCodeToEmail = async (email: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('email_verification_sid') as string)
    .verifications.create({ to: email, channel: 'email' })
}

// +1 for USA, will need to modify if we go global
export const sendCodeToPhone = async (phone: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('sms_verification_sid') as string)
    .verifications.create({ to: `+1${phone}`, channel: 'sms' })
}

export const sendCodeToEmailTemplate = async (email: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('email_verification_sid') as string)
    .verifications.create({
      channelConfiguration: {
        templateId: 'd-cab4252f1e01489b9e3fb576f10ee0e9',
        from: 'muhammadazeem@falconit.com.pk',
        fromName: 'Hlyx Link Request'
      },
      to: email,
      channel: 'email'
    })
}

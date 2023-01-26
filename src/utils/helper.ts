import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { config } from '../config/env.config.validations'
import { IUser } from '../config/interfaces/user.validation.interface'
import { IEmail } from '../config/interfaces/common.interface'
import { messages } from '../config/messages'
import { twilioClient } from './twilio'

export const forgotPasswordEmailTemplate = (user: IUser, link: string): IEmail => {
  const msg: IEmail = {
    to: user.email,
    from: messages.SENDER_EMAIL,
    subject: 'Reset Password',
    text: 'Frontlinegig reset password link',
    html: `Hi <strong>${user.name}
    }!</strong><br> Here is Your Reset Password Link, Please Click: <strong><a href='${link}'>Here</a></strong> Which is only valid for 5 minutes`
  }

  return msg
}

export const sendCodeToEmail = async (email: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('email_verification_sid') as string)
    .verifications.create({ to: email, channel: 'email' })
}

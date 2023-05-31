import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification'
import { config } from '../config/env.config.validations'
import { twilioClient } from './twilio'
import { sgMail } from './sendgrid'
import { messages } from '../config/messages'

export const verifyEmailEmailer = async (email: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('email_verification_sid') as string)
    .verifications.create({
      channelConfiguration: {
        substitutions: {
          email,
          callback_url: 'http://localhost:4000/api/v1/auth/verify-email-url'
        }
      },
      to: email,
      channel: 'email'
    })
}

export const passwordResetEmailer = async (email: string): Promise<VerificationInstance> => {
  return await twilioClient.verify.v2
    .services(config.get('email_password_reset_sid') as string)
    .verifications.create({
      channelConfiguration: {
        substitutions: {
          email
        }
      },
      to: email,
      channel: 'email'
    })
}

export const linkRequestEmail = async (email: string, emailerName: string, linkRequesterName: string): Promise<void> => {
  const templateId = 'd-5c1f2de002b4462b8acf7ca9b7e6b12f'

  const msg = {
    to: email,
    from: 'hello@hlyx.io',
    templateId,
    dynamicTemplateData: {
      email,
      emailerName,
      linkRequesterName
    }
  }

  try {
    const response = await sgMail.send(msg)
    if (response[0].statusCode !== 202) {
      throw Error(messages.EMAILER_ERROR)
    }
  } catch (error: any) {
    console.error(error)
  }
}

export const contactRequestEmailer = async (email: string, emailerName: string, contactRequesterFullName: string, cardName: string): Promise<void> => {
  const templateId = 'd-1ab30a0250e84226967a4873fae0733c'

  const msg = {
    to: email,
    from: 'hello@hlyx.io',
    templateId,
    dynamicTemplateData: {
      email,
      emailerName,
      contactRequesterFullName,
      cardName
    }
  }

  try {
    const response = await sgMail.send(msg)
    if (response[0].statusCode !== 202) {
      throw Error(messages.EMAILER_ERROR)
    }
  } catch (error: any) {
    console.error(error)
  }
}

export const acceptContactEmailer = async (email: string, contactName: string, userName: string, cardUrl: string, qrCodeUrl: string): Promise<void> => {
  const templateId = 'd-c36e1f885cd74f82a3ad43d9e642a262'

  const msg = {
    to: email,
    from: 'hello@hlyx.io',
    templateId,
    dynamicTemplateData: {
      email,
      contactName,
      userName,
      cardUrl,
      qrCodeUrl
    }
  }

  try {
    const response = await sgMail.send(msg)
    if (response[0].statusCode !== 202) {
      throw Error(messages.EMAILER_ERROR)
    }
  } catch (error: any) {
    console.error(error)
  }
}

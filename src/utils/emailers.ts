import { sgMail } from './sendgrid'

export const linkRequestEmail = async (email: string, emailerName: string, linkRequesterName: string): Promise<void> => {
  const templateId = 'd-5c1f2de002b4462b8acf7ca9b7e6b12f'

  const msg = {
    to: email,
    from: 'hello@hlyx.io',
    subject: 'HLYX Link Request',
    templateId,
    dynamicTemplateData: {
      email,
      emailerName,
      linkRequesterName
    }
  }

  try {
    const response = await sgMail.send(msg)
    console.log(response)
  } catch (error: any) {
    console.error(error)
  }
}

export const contactRequestEmailer = async (email: string, emailerName: string, contactRequesterFullName: string, contactRequesterFirstName: string, cardName: string): Promise<void> => {
  const templateId = 'd-1ab30a0250e84226967a4873fae0733c'

  const msg = {
    to: email,
    from: 'hello@hlyx.io',
    subject: 'HLYX Contact Request',
    templateId,
    dynamicTemplateData: {
      email,
      emailerName,
      contactRequesterFullName,
      contactRequesterFirstName,
      cardName
    }
  }

  try {
    const response = await sgMail.send(msg)
    console.log(response)
  } catch (error: any) {
    console.error(error)
  }
}

export const acceptContactEmailer = async (email: string, contactName: string, userName: string, cardUrl: string, qrCodeUrl: string): Promise<void> => {
  const templateId = 'd-c36e1f885cd74f82a3ad43d9e642a262'

  const msg = {
    to: email,
    from: 'hello@hlyx.io',
    subject: 'HLYX Contact Request',
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
    console.log(response)
  } catch (error: any) {
    console.error(error)
  }
}

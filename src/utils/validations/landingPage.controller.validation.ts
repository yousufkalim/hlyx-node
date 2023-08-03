import Joi from 'joi'
import { IContactUs } from '../../config/interfaces/landingPage.validation.interface'
import { stringLengths } from '../../config/stringLengths'

/**
 *
 * @param contactUsPayload
 * @returns Error message
 */

export const validateContactUs = (contactUsPayload: IContactUs): string | undefined => {
  const contactUsSchema = Joi.object({
    name: Joi.string()
      .min(stringLengths.NAME_MIN)
      .max(stringLengths.NAME_MAX)
      .required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    phone: Joi.string()
      .min(stringLengths.PHONE_MIN)
      .max(stringLengths.PHONE_MAX)
      .pattern(/^[0-9]+$/)
      .required(),
    subject: Joi.string()
      .min(stringLengths.CONTACT_US_SUBJECT_MIN)
      .max(stringLengths.CONTACT_US_SUBJECT_MAX)
      .required(),
    message: Joi.string()
      .min(stringLengths.CONTACT_US_MESSAGE_MIN)
      .max(stringLengths.CONTACT_US_MESSAGE_MAX)
      .required()
  })
  return contactUsSchema.validate(contactUsPayload)?.error?.message
}

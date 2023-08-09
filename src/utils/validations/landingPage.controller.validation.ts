import Joi from 'joi'

import { IValidateLandingPageRegister, IContactUs } from '../../config/interfaces/landingPage.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { messages } from '../../config/messages'
import { listIdentifier } from '../../config/enumTypes'

/**
 *
 * @param registerPayload
 * @returns Error message
 */

export const validateLandingPageRegister = (registerPayload: IValidateLandingPageRegister): string | undefined => {
  const registerSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string()
      .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$&+,:;=?@#|'<>.^*()%!-]{8,}$/)
      .required()
      .error(new Error(`${messages.PASSWORD_FAILURE}`)),
    firstName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
    middleInitial: Joi.string().max(stringLengths.MIDDLE_INITIAL_MAX).allow(''),
    lastName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
    listIdentifier: Joi.string().valid(...listIdentifier).required(),
    status: Joi.boolean().required()
  })
  console.log(registerPayload)
  return registerSchema.validate(registerPayload)?.error?.message
}

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

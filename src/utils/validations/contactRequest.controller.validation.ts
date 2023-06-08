import Joi from 'joi'
import {
  IValidateContactRequest,
  IValidateContactNote
} from '../../config/interfaces/contactRequest.validation.interface'
// import { stateAbbreviations } from '../../config/stateAbbreviations'
import { stringLengths } from '../../config/stringLengths'

/**
 *
 * @param sharedContactPayload
 * @returns Error message
 */
export const validateSharedContactCreate = (
  sharedContactPayload: IValidateContactRequest
): string | undefined => {
  const sharedContactSchema = Joi.object({
    cardId: Joi.string().required(),
    fullName: Joi.string()
      .min(stringLengths.FULL_NAME_MIN)
      .max(stringLengths.FULL_NAME_MAX)
      .required(),
    company: Joi.string().max(stringLengths.COMPANY_MAX).allow(''),
    jobTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX).allow(''),
    phone: Joi.string().min(stringLengths.PHONE_MIN).max(stringLengths.PHONE_MAX).required(),
    city: Joi.string().max(stringLengths.LOCATION_MAX).allow(''),
    state: Joi.string().max(stringLengths.LOCATION_MAX).allow(''),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    message: Joi.string().max(stringLengths.MESSAGE_MAX).allow(''),
    notes: Joi.string().max(stringLengths.MESSAGE_MAX).allow('')
  })

  return sharedContactSchema.validate(sharedContactPayload)?.error?.message
}

/**
 *
 * @param noteUpdatePayload
 * @returns Error message
 */
export const validateSharedContactNote = (
  noteUpdatePayload: IValidateContactNote
): string | undefined => {
  const sharedContactNoteSchema = Joi.object({
    notes: Joi.string().max(stringLengths.NOTE_MAX).required()
  })

  return sharedContactNoteSchema.validate(noteUpdatePayload)?.error?.message
}

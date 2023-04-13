import Joi from 'joi'
import { IValidateSharedContact } from '../../config/interfaces/sharedContact.validation.interface'
import { stringLengths } from '../../config/stringLengths'

/**
 *
 * @param sharedContactPayload
 * @returns Error message
 */
export const validateSharedContactCreate = (sharedContactPayload: IValidateSharedContact): string | undefined => {
  const sharedContactSchema = Joi.object({
    cardId: Joi.string().required(),
    fullName: Joi.string().min(stringLengths.FULL_NAME_MIN).max(stringLengths.FULL_NAME_MAX).required(),
    company: Joi.string().max(stringLengths.COMPANY_MAX),
    jobTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
    phone: Joi.string().min(stringLengths.PHONE_MIN).max(stringLengths.PHONE_MAX).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    message: Joi.string().max(stringLengths.SHARED_CONTACT_MESSAGE_MAX)
  })

  return (sharedContactSchema.validate(sharedContactPayload)?.error?.message)
}

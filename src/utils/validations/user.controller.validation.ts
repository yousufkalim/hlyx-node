import Joi from 'joi'
import { IValidateUserUpdate, IValidateProfileImage } from '../../config/interfaces/user.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { stateAbbreviations } from '../../config/stateAbbreviations'

/**
 *
 * @param userUpdatePayload
 * @returns Error message
 */
export const validateUserUpdate = (userUpdatePayload: IValidateUserUpdate): string | undefined => {
  const userUpdateSchema = Joi.object({
    firstName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
    middleInitial: Joi.string().max(stringLengths.MIDDLE_INITIAL_MAX),
    lastName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
    company: Joi.string().max(stringLengths.COMPANY_MAX),
    profTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
    industry: Joi.string().max(stringLengths.INDUSTRY_MAX),
    profRole: Joi.string().max(stringLengths.PROFESSIONAL_ROLE_MAX),
    website: Joi.string().max(stringLengths.WEBSITES_MAX),
    country: Joi.string().max(stringLengths.COUNTRY_MAX),
    city: Joi.string().max(stringLengths.CITY_MAX),
    state: Joi.string().valid(...Object.values(stateAbbreviations)),
    zipcode: Joi.string().min(stringLengths.ZIPCODE_MIN).max(stringLengths.ZIPCODE_MAX).pattern(/^[0-9]+$/)
  })
  return (userUpdateSchema.validate(userUpdatePayload)?.error?.message)
}

/**
 *
 * @param validateProfileImagePaylaod
 * @returns Error message
 */
export const validateProfileImage = (validateProfileImagePaylaod: IValidateProfileImage): string | undefined => {
  const profileImageSchema = Joi.object({
    profileImage: Joi.string().max(stringLengths.IMAGE_MAX)
  })

  return (profileImageSchema.validate(validateProfileImagePaylaod)?.error?.message)
}

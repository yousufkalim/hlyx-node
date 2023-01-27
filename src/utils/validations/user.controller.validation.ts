import Joi from 'joi'
import { IValidateUserUpdate, IValidateName, IValidateProfileImage } from '../../config/interfaces/user.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { stateAbbreviations } from '../../config/stateAbbreviations'

/**
 *
 * @param userUpdatePayload
 * @returns Error message
 */
export const validateUserUpdate = (userUpdatePayload: IValidateUserUpdate): string | undefined => {
  const userUpdateSchema = Joi.object({
    name: Joi.object({
      firstName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
      middleInitial: Joi.string().max(stringLengths.MIDDLE_INITIAL_MAX),
      lastName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required()
    }).required(),
    phone: Joi.string().min(stringLengths.PHONE_MIN).max(stringLengths.PHONE_MAX).pattern(/^[0-9]+$/).required(),
    profileImage: Joi.string().max(stringLengths.IMAGE_MAX),
    profession: Joi.object({
      company: Joi.string().max(stringLengths.COMPANY_MAX),
      professionalTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
      industry: Joi.string().max(stringLengths.INDUSTRY_MAX)
    }),
    location: Joi.object({
      country: Joi.string().max(stringLengths.COUNTRY_MAX),
      city: Joi.string().max(stringLengths.CITY_MAX),
      state: Joi.string().valid(...Object.values(stateAbbreviations)),
      zipcode: Joi.string().min(stringLengths.ZIPCODE_MIN).max(stringLengths.ZIPCODE_MAX).pattern(/^[0-9]+$/)
    })
  })
  return (userUpdateSchema.validate(userUpdatePayload)?.error?.message)
}

/**
 *
 * @param updateNamePayload
 * @returns Error message
 */
export const validateNameUpdate = (updateNamePayload: IValidateName): string | undefined => {
  const nameSchema = Joi.object({
    name: Joi.object({
      firstName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
      middleInitial: Joi.string().max(stringLengths.MIDDLE_INITIAL_MAX).optional().allow(''),
      lastName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required()
    }).required()
  })
  return (nameSchema.validate(updateNamePayload)?.error?.message)
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

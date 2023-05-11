import Joi from 'joi'
import {
  IValidateUserPreference,
  IValidateUserUpdate
} from '../../config/interfaces/user.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { stateAbbreviations } from '../../config/stateAbbreviations'
import { twoFactorAuthTypes } from '../../config/enumTypes'

/**
 *
 * @param userUpdatePayload
 * @returns Error message
 */
export const validateUserUpdate = (userUpdatePayload: IValidateUserUpdate): string | undefined => {
  const userUpdateSchema = Joi.object({
    firstName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
    middleInitial: Joi.string().max(stringLengths.MIDDLE_INITIAL_MAX).allow(''),
    lastName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required(),
    company: Joi.string().max(stringLengths.COMPANY_MAX),
    profTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
    industry: Joi.string().max(stringLengths.INDUSTRY_MAX),
    profRole: Joi.string().max(stringLengths.PROFESSIONAL_ROLE_MAX),
    website: Joi.string().max(stringLengths.WEBSITES_MAX),
    country: Joi.string().max(stringLengths.COUNTRY_MAX),
    city: Joi.string().max(stringLengths.CITY_MAX),
    state: Joi.string().valid(...Object.values(stateAbbreviations)),
    zipcode: Joi.string()
      .min(stringLengths.ZIPCODE_MIN)
      .max(stringLengths.ZIPCODE_MAX)
      .pattern(/^[0-9]+$/)
  })
  return userUpdateSchema.validate(userUpdatePayload)?.error?.message
}

export const validateUserPreferences = (
  userPreferencePayload: IValidateUserPreference
): string | undefined => {
  const userPreferenceSchema = Joi.object({
    twoFactorAuth: Joi.string().valid(...Object.values(twoFactorAuthTypes)),
    allCardsPrivate: Joi.boolean(),
    connectionViaProfileLink: Joi.boolean(),
    connectionViaQRCode: Joi.boolean(),
    connectionViaPerson: Joi.boolean()
  })
  return userPreferenceSchema.validate(userPreferencePayload)?.error?.message
}

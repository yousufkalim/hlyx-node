import Joi from 'joi'
import { IValidateCardUpdate, IValidateCardPhoto } from '../../config/interfaces/card.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { emailTypes, phoneTypes, academicLevels, degreeTypes } from '../../config/enumTypes'
import { stateAbbreviations } from '../../config/stateAbbreviations'
import { arrayLimits } from '../../config/arrayLimits'

/**
 *
 * @param cardUpdatePayload
 * @returns Error message
 */
export const validateCardUpdate = (cardUpdatePayload: IValidateCardUpdate): string | undefined => {
  const cardSchema = Joi.object({
    fullName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX),
    coverPhoto: Joi.string().max(stringLengths.IMAGE_MAX),
    emails: Joi.array().max(arrayLimits.MAX_EMAILS).items(Joi.object({
      email: Joi.string().min(stringLengths.EMAIL_MIN).max(stringLengths.EMAIL_MAX).email({ tlds: { allow: false } }),
      type: Joi.string().valid(...Object.values(emailTypes))
    })),
    phones: Joi.array().max(arrayLimits.MAX_PHONES).items(Joi.object({
      phone: Joi.string().min(stringLengths.PHONE_MIN).max(stringLengths.PHONE_MAX).pattern(/^[0-9]+$/),
      extention: Joi.string().max(stringLengths.PHONE_EXT_MAX).pattern(/^[0-9]+$/).optional().allow(''),
      type: Joi.string().valid(...Object.values(phoneTypes))
    })),
    calendar: Joi.string().max(stringLengths.CALENDAR_MAX),
    websites: Joi.array().max(arrayLimits.MAX_WEBSITES).items(Joi.object({
      addresses: Joi.string().max(stringLengths.WEBSITES_MAX).hostname(),
      descriptions: Joi.string().max(stringLengths.WEBSITES_DESC_MAX).optional().allow('')
    })),
    country: Joi.string().max(stringLengths.COUNTRY_MAX).optional().allow(''),
    city: Joi.string().max(stringLengths.CITY_MAX).optional().allow(''),
    state: Joi.string().valid(...Object.values(stateAbbreviations)).optional().allow(''),
    streetAddress: Joi.string().max(stringLengths.STREET_MAX),
    zipcode: Joi.string().min(stringLengths.ZIPCODE_MIN).max(stringLengths.ZIPCODE_MAX).pattern(/^[0-9]+$/).optional().allow(''),
    socialMedias: Joi.array().max(arrayLimits.MAX_SOCIAL_MEDIA).items(Joi.object({
      platforms: Joi.string().max(stringLengths.PLATFORM_MAX).hostname(),
      handles: Joi.string().max(stringLengths.HANDLES_MAX)
    })),
    additionalLinks: Joi.array().max(arrayLimits.MAX_ADDITIONAL_LINKS).items(Joi.object({
      platforms: Joi.string().max(stringLengths.PLATFORM_MAX).hostname(),
      handles: Joi.string().max(stringLengths.HANDLES_MAX),
      descriptions: Joi.string().max(stringLengths.LINK_DESC_MAX).optional().allow('')
    })),
    about: Joi.string().max(stringLengths.ABOUT_MAX).optional().allow(''),
    company: Joi.string().max(stringLengths.COMPANY_MAX),
    profTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
    occupation: Joi.string().max(stringLengths.OCCUPATION_MAX),
    industry: Joi.string().max(stringLengths.INDUSTRY_MAX),
    educationLevel: Joi.string().valid(...Object.values(academicLevels)),
    schoolName: Joi.string().max(stringLengths.SCHOOL_NAME_MAX).optional().allow(''),
    academicFocus: Joi.string().max(stringLengths.SCHOOL_ACADEMIC_CONC_MAX).optional().allow(''),
    degreeType: Joi.string().valid(...Object.values(degreeTypes)),
    accolades: Joi.array().max(arrayLimits.MAX_ACCOLADES).items(Joi.string().max(stringLengths.ACCOLADES_MAX)),
    achievements: Joi.array().max(arrayLimits.MAX_ACHIEVEMENTS).items(Joi.object({
      title: Joi.string().max(stringLengths.AWARDS_TITLES_MAX),
      issuedBy: Joi.string().max(stringLengths.AWARDS_ISSUED_BY_MAX).optional().allow(''),
      issueYear: Joi.string().min(4).max(4).valid(/^[0-9]+$/)
    })),
    businessGoals: Joi.array().max(arrayLimits.MAX_BUSINESSGOALS).items(Joi.string().max(stringLengths.GOALS_MAX)),
    needsAsks: Joi.array().max(arrayLimits.MAX_NEEDSASKS).items(Joi.string().max(stringLengths.NEEDSASKS_MAX)),
    hobbies: Joi.array().max(arrayLimits.MAX_HOBBIES).items(Joi.string().max(stringLengths.HOBBIES_MAX)),
    interests: Joi.array().max(arrayLimits.MAX_INTERESTS).items(Joi.string().max(stringLengths.INTERESTS_MAX)),
    skills: Joi.array().max(arrayLimits.MAX_SKILLS).items(Joi.string().max(stringLengths.SKILLS_MAX)),
    motto: Joi.string().max(stringLengths.MOTTO_MAX),
    services: Joi.array().max(arrayLimits.MAX_SERVICES).items(Joi.object({
      title: Joi.string().max(stringLengths.SERVICES_TITLE),
      icon: Joi.string().max(stringLengths.IMAGE_MAX),
      details: Joi.string().max(stringLengths.SERVICES_DETAILS)
    }))
  })
  return (cardSchema.validate(cardUpdatePayload)?.error?.message)
}

/**
 *
 * @param cardPhotoPayload
 * @returns Error message
 */
export const validateCovePhoto = (cardPhotoPayload: IValidateCardPhoto): string | undefined => {
  const photoSchema = Joi.object({
    coverPhoto: Joi.string().max(stringLengths.IMAGE_MAX)
  })
  return (photoSchema.validate(cardPhotoPayload)?.error?.message)
}

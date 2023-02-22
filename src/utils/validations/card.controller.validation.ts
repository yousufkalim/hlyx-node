import Joi from 'joi'
import { IValidateCardUpdate, IValidateCardPhoto } from '../../config/interfaces/card.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { emailTypes, phoneTypes, academicLevels, degreeTypes, businessGoalsStatus, businessNeedsStatus, servicesTypes, portfolioTypes } from '../../config/enumTypes'
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
      website: Joi.string().max(stringLengths.WEBSITES_MAX).hostname(),
      description: Joi.string().max(stringLengths.WEBSITES_DESC_MAX).optional().allow('')
    })),
    country: Joi.string().max(stringLengths.COUNTRY_MAX).optional().allow(''),
    city: Joi.string().max(stringLengths.CITY_MAX).optional().allow(''),
    state: Joi.string().valid(...Object.values(stateAbbreviations)).optional().allow(''),
    streetAddress: Joi.string().max(stringLengths.STREET_MAX),
    zipcode: Joi.string().min(stringLengths.ZIPCODE_MIN).max(stringLengths.ZIPCODE_MAX).pattern(/^[0-9]+$/).optional().allow(''),
    socialMedias: Joi.array().max(arrayLimits.MAX_SOCIAL_MEDIA).items(Joi.object({
      platform: Joi.string().max(stringLengths.PLATFORM_MAX).hostname(),
      handle: Joi.string().max(stringLengths.HANDLES_MAX)
    })),
    additionalLinks: Joi.array().max(arrayLimits.MAX_ADDITIONAL_LINKS).items(Joi.object({
      website: Joi.string().max(stringLengths.WEBSITES_MAX).hostname(),
      icon: Joi.string().max(stringLengths.IMAGE_MAX),
      title: Joi.string().max(stringLengths.SERVICES_TITLE),
      description: Joi.string().max(stringLengths.LINK_DESC_MAX).optional().allow('')
    })),
    about: Joi.string().max(stringLengths.ABOUT_MAX).optional().allow(''),
    company: Joi.string().max(stringLengths.COMPANY_MAX),
    profTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
    occupation: Joi.string().max(stringLengths.OCCUPATION_MAX),
    industry: Joi.string().max(stringLengths.INDUSTRY_MAX),
    education: Joi.array().max(arrayLimits.MAX_EDUCATIONS).items(Joi.object({
      academicLevel: Joi.string().valid(...Object.values(academicLevels)),
      schoolName: Joi.string().max(stringLengths.SCHOOL_NAME_MAX).optional().allow(''),
      graduationYear: Joi.string().min(4).max(4).pattern(/^[0-9]+$/),
      academicFocus: Joi.string().max(stringLengths.SCHOOL_ACADEMIC_CONC_MAX).optional().allow(''),
      degreeType: Joi.string().valid(...Object.values(degreeTypes))
    })),
    accolades: Joi.array().max(arrayLimits.MAX_ACCOLADES).items(Joi.object({
      title: Joi.string().max(stringLengths.AWARDS_TITLES_MAX),
      fromWho: Joi.string().max(stringLengths.AWARDS_ISSUED_BY_MAX).optional().allow(''),
      startDate: Joi.date(),
      endDate: Joi.date()
    })),
    achievements: Joi.array().max(arrayLimits.MAX_ACHIEVEMENTS).items(Joi.object({
      title: Joi.string().max(stringLengths.AWARDS_TITLES_MAX),
      issuedBy: Joi.string().max(stringLengths.AWARDS_ISSUED_BY_MAX).optional().allow(''),
      issuedYear: Joi.string().min(4).max(4).pattern(/^[0-9]+$/)
    })),
    businessGoals: Joi.array().max(arrayLimits.MAX_BUSINESSGOALS).items(Joi.object({
      status: Joi.string().valid(...Object.values(businessGoalsStatus)),
      title: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_TITLE),
      subTitle: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_SUBTITLE),
      percentComplete: Joi.number().integer().min(0).max(100),
      startDate: Joi.date(),
      endDate: Joi.date(),
      about: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_ABOUT)
    })),
    businessNeeds: Joi.array().max(arrayLimits.MAX_NEEDSASKS).items(Joi.object({
      date: Joi.date(),
      title: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_TITLE),
      subTitle: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_SUBTITLE),
      status: Joi.string().valid(...Object.values(businessNeedsStatus))
    })),
    hobbies: Joi.array().max(arrayLimits.MAX_HOBBIES).items(Joi.string().max(stringLengths.HOBBIES_MAX)),
    interests: Joi.array().max(arrayLimits.MAX_INTERESTS).items(Joi.string().max(stringLengths.INTERESTS_MAX)),
    skills: Joi.array().max(arrayLimits.MAX_SKILLS).items(Joi.string().max(stringLengths.SKILLS_MAX)),
    motto: Joi.string().max(stringLengths.MOTTO_MAX),
    services: Joi.array().max(arrayLimits.MAX_SERVICES).items(Joi.object({
      type: Joi.string().valid(...Object.values(servicesTypes)),
      title: Joi.string().max(stringLengths.SERVICES_TITLE),
      subTitle: Joi.string().max(stringLengths.SERVICES_SUBTITLE),
      icon: Joi.string().max(stringLengths.IMAGE_MAX),
      details: Joi.string().max(stringLengths.SERVICES_DETAILS)
    })),
    portfolio: Joi.array().max(arrayLimits.MAX_PORTFOLIO).items(Joi.object({
      type: Joi.string().valid(...Object.values(portfolioTypes)),
      image: Joi.string().max(stringLengths.IMAGE_MAX),
      title: Joi.string().max(stringLengths.PORTFOLIO_TITLE),
      subTitle: Joi.string().max(stringLengths.PORTFOLIO_SUBTITLE)
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

import Joi from 'joi'
import { IValidateCardName, IValidateCardFullName, IValidateCardContactPage, IValidateCardAboutPage, IValidateCardServices, IValidateCardPortfolio, IValidateCardSlug } from '../../config/interfaces/card.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { emailTypes, phoneTypes, academicLevels, additionalLinksType, degreeTypes, businessGoalsStatus, businessNeedsStatus, servicesTypes, socialMedia } from '../../config/enumTypes'
import { stateAbbreviations } from '../../config/stateAbbreviations'
import { arrayLimits } from '../../config/arrayLimits'

/**
 *
 * @param cardNamePayload
 * @returns Error message
 */
export const validateCardName = (cardNamePayload: IValidateCardName): string | undefined => {
  const cardNameSchema = Joi.object({
    cardName: Joi.string().min(stringLengths.CARD_NAME_MIN).max(stringLengths.CARD_NAME_MAX).required()
  })
  return (cardNameSchema.validate(cardNamePayload)?.error?.message)
}

/**
 *
 * @param cardFullNamePayload
 * @returns Error message
 */
export const validateCardFullName = (cardFullNamePayload: IValidateCardFullName): string | undefined => {
  const fullNameSchema = Joi.object({
    fullName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX).required()
  })
  return (fullNameSchema.validate(cardFullNamePayload)?.error?.message)
}

/**
 *
 * @param cardContactPagePayload
 * @returns Error message
 */
export const validateCardContactPage = (cardContactPagePayload: IValidateCardContactPage): string | undefined => {
  const contactPageSchema = Joi.object({
    headerPhoto: Joi.string(),
    emails: Joi.array().max(arrayLimits.MAX_EMAILS).items(Joi.object({
      email: Joi.string().min(stringLengths.EMAIL_MIN).max(stringLengths.EMAIL_MAX).email({ tlds: { allow: false } }).required(),
      type: Joi.string().valid(...Object.values(emailTypes))
    })),
    phones: Joi.array().max(arrayLimits.MAX_PHONES).items(Joi.object({
      phone: Joi.string().min(stringLengths.PHONE_MIN).max(stringLengths.PHONE_MAX).pattern(/^[0-9]+$/).required(),
      extention: Joi.string().max(stringLengths.PHONE_EXT_MAX).pattern(/^[0-9]+$/).allow(''),
      type: Joi.string().valid(...Object.values(phoneTypes)).required()
    })),
    calendar: Joi.string().max(stringLengths.CALENDAR_MAX),
    websites: Joi.array().max(arrayLimits.MAX_WEBSITES).items(Joi.object({
      url: Joi.string().max(stringLengths.WEBSITES_MAX).hostname().required(),
      description: Joi.string().max(stringLengths.WEBSITES_DESC_MAX)
    })),
    country: Joi.string().max(stringLengths.COUNTRY_MAX),
    city: Joi.string().max(stringLengths.CITY_MAX),
    state: Joi.string().valid(...Object.values(stateAbbreviations)),
    streetAddress: Joi.string().max(stringLengths.STREET_MAX),
    zipcode: Joi.string().min(stringLengths.ZIPCODE_MIN).max(stringLengths.ZIPCODE_MAX).pattern(/^[0-9]+$/),
    socialMedias: Joi.array().max(arrayLimits.MAX_SOCIAL_MEDIA).items(Joi.object({
      platform: Joi.string().valid(...Object.values(socialMedia)).required(),
      handle: Joi.string().max(stringLengths.HANDLES_MAX).required()
    })),
    additionalLinks: Joi.array().max(arrayLimits.MAX_ADDITIONAL_LINKS).items(Joi.object({
      url: Joi.string().max(stringLengths.WEBSITES_MAX).hostname().required(),
      title: Joi.string().max(stringLengths.SERVICES_TITLE).required(),
      typeContent: Joi.string().valid(...Object.values(additionalLinksType)),
      description: Joi.string().max(stringLengths.LINK_DESC_MAX)
    }))
  })
  return (contactPageSchema.validate(cardContactPagePayload)?.error?.message)
}

/**
 *
 * @param cardAboutPagePayload
 * @returns Error message
 */
export const validateCardAboutPage = (cardAboutPagePayload: IValidateCardAboutPage): string | undefined => {
  const aboutPageSchema = Joi.object({
    about: Joi.string().max(stringLengths.ABOUT_MAX),
    company: Joi.string().max(stringLengths.COMPANY_MAX),
    profTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
    occupation: Joi.string().max(stringLengths.OCCUPATION_MAX),
    industry: Joi.string().max(stringLengths.INDUSTRY_MAX),
    education: Joi.array().max(arrayLimits.MAX_EDUCATIONS).items(Joi.object({
      academicLevel: Joi.string().valid(...Object.values(academicLevels)),
      schoolName: Joi.string().max(stringLengths.SCHOOL_NAME_MAX).required(),
      startYear: Joi.string().min(4).max(4).pattern(/^[0-9]+$/),
      graduationYear: Joi.string().min(4).max(4).pattern(/^[0-9]+$/).allow('Present'),
      academicFocus: Joi.string().max(stringLengths.SCHOOL_ACADEMIC_CONC_MAX),
      degreeType: Joi.string().valid(...Object.values(degreeTypes))
    })),
    accolades: Joi.array().max(arrayLimits.MAX_ACCOLADES).items(Joi.object({
      title: Joi.string().max(stringLengths.AWARDS_TITLES_MAX).required(),
      fromWho: Joi.string().max(stringLengths.AWARDS_ISSUED_BY_MAX),
      startDate: Joi.date(),
      endDate: Joi.date().allow('Present')
    })),
    achievements: Joi.array().max(arrayLimits.MAX_ACHIEVEMENTS).items(Joi.object({
      title: Joi.string().max(stringLengths.AWARDS_TITLES_MAX).required(),
      startYear: Joi.string().min(4).max(4).pattern(/^[0-9]+$/),
      issuedYear: Joi.string().min(4).max(4).pattern(/^[0-9]+$/).allow('Present'),
      description: Joi.string().max(stringLengths.AWARDS_DESCRIPTION_MAX)
    })),
    businessGoals: Joi.array().max(arrayLimits.MAX_BUSINESSGOALS).items(Joi.object({
      status: Joi.string().valid(...Object.values(businessGoalsStatus)).required(),
      title: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_TITLE).required(),
      percentComplete: Joi.number().integer().min(0).max(100).required(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      description: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_DESC)
    })),
    businessNeeds: Joi.array().max(arrayLimits.MAX_NEEDSASKS).items(Joi.object({
      date: Joi.date(),
      title: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_TITLE).required(),
      description: Joi.string().max(stringLengths.BUSINESS_GOAL_NEEDS_DESC),
      status: Joi.string().valid(...Object.values(businessNeedsStatus)).required()
    })),
    hobbies: Joi.array().max(arrayLimits.MAX_HOBBIES).items(Joi.string().max(stringLengths.HOBBIES_MAX)),
    interests: Joi.array().max(arrayLimits.MAX_INTERESTS).items(Joi.string().max(stringLengths.INTERESTS_MAX)),
    skills: Joi.array().max(arrayLimits.MAX_SKILLS).items(Joi.string().max(stringLengths.SKILLS_MAX)),
    motto: Joi.string().max(stringLengths.MOTTO_MAX)
  })
  return (aboutPageSchema.validate(cardAboutPagePayload)?.error?.message)
}

/**
 *
 * @param cardServicesPayload
 * @returns Error message
 */
export const validateCardServices = (cardServicesPayload: IValidateCardServices): string | undefined => {
  const servicesSchema = Joi.object({
    services: Joi.array().max(arrayLimits.MAX_SERVICES).items(Joi.object({
      type: Joi.string().valid(...Object.values(servicesTypes)).required(),
      title: Joi.string().max(stringLengths.SERVICES_TITLE).required(),
      subtitle: Joi.string().max(stringLengths.SERVICES_SUBTITLE),
      details: Joi.string().max(stringLengths.SERVICES_DETAILS),
      positioning: Joi.number().integer().min(0).max(arrayLimits.MAX_SERVICES).required()
    })).required()
  })
  return (servicesSchema.validate(cardServicesPayload)?.error?.message)
}

/**
 *
 * @param cardPortfolioPayload
 * @returns Error message
 */
export const validateCardPortfolio = (cardPortfolioPayload: IValidateCardPortfolio): string | undefined => {
  const portfolioSchema = Joi.object({
    portfolio: Joi.array().max(arrayLimits.MAX_PORTFOLIO).items(Joi.object({
      image: Joi.string().max(stringLengths.IMAGE_MAX).required(),
      title: Joi.string().max(stringLengths.PORTFOLIO_TITLE),
      details: Joi.string().max(stringLengths.PORTFOLIO_DETAILS),
      positioning: Joi.number().integer().min(0).max(arrayLimits.MAX_PORTFOLIO).required()
    })).required()
  })
  return (portfolioSchema.validate(cardPortfolioPayload)?.error?.message)
}

/**
 *
 * @param cardSlugPayload
 * @returns Error message
 */
export const validateCardSlug = (cardSlugPayload: IValidateCardSlug): string | undefined => {
  const slugSchema = Joi.object({
    slug: Joi.string().min(stringLengths.SLUG_MIN).max(stringLengths.SLUG_MAX).required()
  })
  return (slugSchema.validate(cardSlugPayload)?.error?.message)
}

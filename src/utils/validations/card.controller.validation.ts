import Joi from 'joi'
import { IValidateCardUpdate } from '../../config/interfaces/card.validation.interface'
import { stringLengths } from '../../config/stringLengths'
import { cardTypes, emailTypes, phoneTypes, academicLevels, degreeTypes, monthList } from '../../config/enumTypes'
import { stateAbbreviations } from '../../config/stateAbbreviations'
import { arrayLimits } from '../../config/arrayLimits'
import { messages } from '../../config/messages'

/**
 *
 * @param cardUpdatePayload
 * @returns Error message
 */
export const validateCardUpdate = (cardUpdatePayload: IValidateCardUpdate): string | undefined => {
  if (!cardTypes.includes(cardUpdatePayload.cardType)) {
    return messages.INVALID_CARDTYPE
  }

  if (cardUpdatePayload.cardType === 'personal') {
    return personalSchemaHelper(cardUpdatePayload)
  } else if (cardUpdatePayload.cardType === 'professional') {
    return professionalSchemaHelper(cardUpdatePayload)
  }
}

const personalSchemaHelper = (cardUpdatePayload: IValidateCardUpdate): string | undefined => {
  const personalOnly = {
    fullName: cardUpdatePayload.fullName,
    coverPhoto: cardUpdatePayload.coverPhoto,
    location: cardUpdatePayload.location,
    emails: cardUpdatePayload.emails,
    phones: cardUpdatePayload.phones,
    websites: cardUpdatePayload.websites,
    socialMediaAccounts: cardUpdatePayload.socialMediaAccounts,
    additionalLinks: cardUpdatePayload.additionalLinks,
    about: cardUpdatePayload.about,
    education: cardUpdatePayload.education,
    awards: cardUpdatePayload.awards,
    hobbies: cardUpdatePayload.hobbies,
    skills: cardUpdatePayload.skills
  }

  const personalSchema = Joi.object({
    fullName: Joi.string().min(stringLengths.NAME_MIN).max(stringLengths.NAME_MAX),
    coverPhoto: Joi.string().max(stringLengths.IMAGE_MAX),
    location: Joi.object({
      country: Joi.string().max(stringLengths.COUNTRY_MAX).optional().allow(''),
      city: Joi.string().max(stringLengths.CITY_MAX).optional().allow(''),
      state: Joi.string().valid(...Object.values(stateAbbreviations)).optional().allow(''),
      zipcode: Joi.string().min(stringLengths.ZIPCODE_MIN).max(stringLengths.ZIPCODE_MAX).pattern(/^[0-9]+$/).optional().allow('')
    }),
    emails: Joi.object({
      emailList: Joi.array().items(Joi.string().min(stringLengths.EMAIL_MIN).max(stringLengths.EMAIL_MAX).email({ tlds: { allow: false } })),
      emailTypes: Joi.array().items(Joi.string().valid(...Object.values(emailTypes)))
    }),
    phones: Joi.object({
      numbers: Joi.array().items(Joi.string().min(stringLengths.PHONE_MIN).max(stringLengths.PHONE_MAX).pattern(/^[0-9]+$/)),
      extentions: Joi.array().items(Joi.string().max(stringLengths.PHONE_EXT_MAX).pattern(/^[0-9]+$/).optional().allow('')),
      phoneTypes: Joi.array().items(Joi.string().valid(...Object.values(phoneTypes)))
    }),
    websites: Joi.object({
      addresses: Joi.array().items(Joi.string().max(stringLengths.WEBSITES_MAX).hostname()),
      descriptions: Joi.array().items(Joi.string().max(stringLengths.WEBSITES_DESC_MAX).optional().allow(''))
    }),
    socialMediaAccounts: Joi.object({
      platforms: Joi.array().items(Joi.string().max(stringLengths.PLATFORM_MAX).hostname()),
      handles: Joi.array().items(Joi.string().max(stringLengths.HANDLES_MAX))
    }),
    additionalLinks: Joi.object({
      platforms: Joi.array().items(Joi.string().max(stringLengths.PLATFORM_MAX).hostname()),
      handles: Joi.array().items(Joi.string().max(stringLengths.HANDLES_MAX)),
      descriptions: Joi.array().items(Joi.string().max(stringLengths.LINK_DESC_MAX).optional().allow(''))
    }),
    about: Joi.string().max(stringLengths.ABOUT_MAX).optional().allow(''),
    education: Joi.object({
      academicLevel: Joi.string().valid(...Object.values(academicLevels)),
      schoolName: Joi.string().max(stringLengths.SCHOOL_NAME_MAX).optional().allow(''),
      academicConcentration: Joi.string().max(stringLengths.SCHOOL_ACADEMIC_CONC_MAX).optional().allow(''),
      degreeType: Joi.string().valid(...Object.values(degreeTypes))
    }),
    awards: Joi.object({
      titles: Joi.array().items(Joi.string().max(stringLengths.AWARDS_TITLES_MAX)),
      issuedBy: Joi.array().items(Joi.string().max(stringLengths.AWARDS_ISSUED_BY_MAX).optional().allow('')),
      issueMonth: Joi.array().items(Joi.string().valid(...Object.values(monthList))),
      issueYear: Joi.array().items(),
      descriptions: Joi.array().items(Joi.string().max(stringLengths.AWARDS_DESCRIPTION_MAX).optional().allow(''))
    }),
    hobbies: Joi.array().items(Joi.string().max(stringLengths.HOBBIES_MAX)),
    skills: Joi.array().items(Joi.string().max(stringLengths.SKILLS_MAX))
  })

  // Return error from Joi schema validate if exists
  const errorCheckSchema = personalSchema.validate(personalOnly)
  if (errorCheckSchema.error != null) {
    return errorCheckSchema.error.message
  }

  // Verify array lengths are under maximum size and same length
  // Emails
  if (personalOnly.emails != null) {
    if (personalOnly.emails.emailList.length > arrayLimits.MAX_EMAILS) {
      return 'Emails' + messages.EXCEEDS_ARRAY_LIMIT
    }
    if (personalOnly.emails.emailList.length !== personalOnly.emails.emailTypes.length) {
      return 'Emails' + messages.ARRAY_LENGTH_DIFFERENT
    }
  }
  // Phones
  if (personalOnly.phones != null) {
    if (personalOnly.phones.numbers.length > arrayLimits.MAX_PHONES) {
      return 'Phones' + messages.EXCEEDS_ARRAY_LIMIT
    }
    if (personalOnly.phones.numbers.length !== personalOnly.phones.extentions.length ||
      personalOnly.phones.numbers.length !== personalOnly.phones.phoneTypes.length) {
      return 'Phones' + messages.ARRAY_LENGTH_DIFFERENT
    }
  }
  // Websites
  if (personalOnly.websites != null) {
    if (personalOnly.websites.addresses.length > arrayLimits.MAX_WEBSITES) {
      return 'Websites' + messages.EXCEEDS_ARRAY_LIMIT
    }
    if (personalOnly.websites.addresses.length !== personalOnly.websites.descriptions.length) {
      return 'Websites' + messages.ARRAY_LENGTH_DIFFERENT
    }
  }
  // Social Media Accounts
  if (personalOnly.socialMediaAccounts != null) {
    if (personalOnly.socialMediaAccounts.platforms.length > arrayLimits.MAX_SOCIAL_MEDIA) {
      return 'Social Media Accounts' + messages.EXCEEDS_ARRAY_LIMIT
    }
    if (personalOnly.socialMediaAccounts.platforms.length !== personalOnly.socialMediaAccounts.handles.length) {
      return 'Social Media Accounts' + messages.ARRAY_LENGTH_DIFFERENT
    }
  }
  // Additional Links
  if (personalOnly.additionalLinks != null) {
    if (personalOnly.additionalLinks.platforms.length > arrayLimits.MAX_SOCIAL_MEDIA) {
      return 'Additional Links' + messages.EXCEEDS_ARRAY_LIMIT
    }
    if (personalOnly.additionalLinks.platforms.length !== personalOnly.additionalLinks.handles.length ||
      personalOnly.additionalLinks.platforms.length !== personalOnly.additionalLinks.descriptions.length) {
      return 'Additional Links' + messages.ARRAY_LENGTH_DIFFERENT
    }
  }
  // Awards
  if (personalOnly.awards != null) {
    if (personalOnly.awards.titles.length > arrayLimits.MAX_AWARDS) {
      return 'Awards' + messages.EXCEEDS_ARRAY_LIMIT
    }
    if (personalOnly.awards.titles.length !== personalOnly.awards.issuedBy.length ||
        personalOnly.awards.titles.length !== personalOnly.awards.issueMonth.length ||
        personalOnly.awards.titles.length !== personalOnly.awards.issueYear.length ||
        personalOnly.awards.titles.length !== personalOnly.awards.descriptions.length) {
      return 'Awards' + messages.ARRAY_LENGTH_DIFFERENT
    }
    // Verify years are within the last 100
    for (let i = 0; i < personalOnly.awards.issueYear.length; i++) {
      const inputValue = parseInt(personalOnly.awards.issueYear[i])
      if (isNaN(inputValue)) {
        return messages.YEAR_NOT_INTEGER
      }
      const oneHundredYearsAgo = new Date().getFullYear() - 100
      if (inputValue < oneHundredYearsAgo) {
        return messages.YEAR_TOO_OLD
      }
    }
  }
}

const professionalSchemaHelper = (cardUpdatePayload: IValidateCardUpdate): string | undefined => {
  const professionalOnly = {
    professionalName: cardUpdatePayload.professionalName,
    profession: cardUpdatePayload.profession
  }

  // Check professional card exclusive fields
  const professionalSchema = Joi.object({
    professionalName: Joi.string().max(stringLengths.PROFESSIONAL_NAME_MAX),
    profession: Joi.object({
      company: Joi.string().max(stringLengths.COMPANY_MAX),
      professionalTitle: Joi.string().max(stringLengths.PROFESSIONAL_TITLE_MAX),
      occupation: Joi.string().max(stringLengths.OCCUPATION_MAX),
      industry: Joi.string().max(stringLengths.INDUSTRY_MAX),
      professionalDescription: Joi.string().max(stringLengths.PROFESSIONAL_DESC_MAX)
    })
  })

  // Return error in Joi schema validate if exists
  const errorCheckSchema = professionalSchema.validate(professionalOnly)
  if (errorCheckSchema.error != null) {
    return errorCheckSchema.error.message
  }

  // Check other fields that are common in personal card
  return personalSchemaHelper(cardUpdatePayload)
}

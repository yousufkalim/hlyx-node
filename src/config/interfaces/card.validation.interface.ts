import { IProfession, ILocation } from './common.interface'

export interface ICard {
  id: number
  cardType: string
  user: number
  urlPath: string
  fullName: string
  professionalName?: string
  coverPhoto?: string
  profession?: ICardProfession
  location?: ILocation
  emails?: ICardEmails
  phones?: ICardPhones
  websites?: ICardWebsites
  socialMediaAccounts?: ICardSocialMediaAccounts
  additionalLinks?: ICardAdditionalLinks
  about?: string
  education?: ICardEducation
  awards?: ICardAwards
  hobbies?: string[]
  skills?: string[]
  qrCodePath?: string
}

export interface IValidateCardUpdate {
  cardType: string
  fullName: string
  professionalName?: string
  coverPhoto?: string
  profession?: ICardProfession
  location?: ILocation
  emails?: ICardEmails
  phones?: ICardPhones
  websites?: ICardWebsites
  socialMediaAccounts?: ICardSocialMediaAccounts
  additionalLinks?: ICardAdditionalLinks
  about?: string
  education?: ICardEducation
  awards?: ICardAwards
  hobbies?: string[]
  skills?: string[]
}

interface ICardProfession extends IProfession {
  occupation?: string
  professionalDescription?: string
}

interface ICardWebsites {
  addresses: string[]
  descriptions: string[]
}

interface ICardSocialMediaAccounts {
  platforms: string[]
  handles: string[]
}

interface ICardAdditionalLinks {
  platforms: string[]
  handles: string[]
  descriptions: string[]
}

interface ICardEducation {
  academicLevel?: string
  schoolName?: string
  academicConcentration?: string
  degreeType?: string
}

interface ICardAwards {
  titles: string[]
  issuedBy: string[]
  issueMonth: string[]
  issueYear: string[]
  descriptions: string[]
}

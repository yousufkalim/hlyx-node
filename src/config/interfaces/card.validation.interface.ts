import { Timestamps, IProfession, ILocation } from './common.interface'

export interface ICard extends Timestamps {
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

export interface IValidateCardCreate {
  cardType: string
  user: number
  urlPath: string
  fullName: string
  profession?: ICardProfession
  location?: ILocation
  emails: ICardEmails
  phones: ICardPhones
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

interface ICardEmails {
  emailList: string[]
  emailTypes: string[]
}

interface ICardPhones {
  numbers: string[]
  extentions: string[]
  phoneTypes: string[]
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

export interface ICard {
  cardId: string
  userId: string
  slug: string
  publicCard: boolean
  templateID: string
  coverPhoto?: string
  coverPhotos: ICardCoverPhotos[]
  companyIcon: string
  fullName: string
  emails?: ICardEmails[]
  phones?: ICardPhones[]
  calendars?: ICardCalendars[]
  websites?: ICardWebsites[]
  officeAddresses?: ICardOfficeAddresses[]
  country?: string
  city: string
  state?: string
  streetAddress?: string
  zipcode?: string
  socialMedias?: ICardSocialMedias[]
  additionalLinks?: ICardAdditionalLinks[]
  about?: string
  company: string
  profTitle: string
  occupation: string
  industry: string
  education?: ICardEducation[]
  accolades?: string[]
  achievements?: ICardAchievements[]
  businessGoals?: string[]
  businessNeeds?: string[]
  hobbies?: string[]
  interests?: string[]
  skills?: string[]
  motto?: string
  services?: ICardServices[]
  portfolioTemplate: string
  portfolio?: ICardPortfolio[]
  qrCode: string
}

export interface IValidateCardName {
  cardName: string
}

export interface IValidateCardFullName {
  fullName: string
}

export enum IProfileLayoutEnum {
  'minimal',
  'premium'
}

export interface IValidateCardContactPage {
  fullName: string
  cardName: string
  publicCard?: boolean
  profileLayout: IProfileLayoutEnum
  isPrivate?: boolean
  emails?: ICardEmails[]
  phones?: ICardPhones[]
  calendar: ICardCalendars[]
  websites?: ICardWebsites[]
  country?: string
  city: string
  state?: string
  streetAddress?: string
  zipcode?: string
  socialMedias?: ICardSocialMedias[]
  additionalLinks?: ICardAdditionalLinks[]
}

export interface IValidateCardAboutPage {
  about?: string
  company: string
  profTitle: string
  occupation: string
  industry: string
  education?: ICardEducation[]
  accolades?: ICardAccolades[]
  achievements?: ICardAchievements[]
  businessGoals?: ICardBusinessGoals[]
  businessNeeds?: ICardBusinessNeeds[]
  hobbies?: string[]
  interests?: string[]
  skills?: string[]
  motto?: string
}

export interface IValidateCardServices {
  services: ICardServices[]
}

export interface IValidateCardPortfolio {
  portfolio: ICardPortfolio[]
}

export interface IValidateCardSlug {
  slug: string
}

interface ICardCoverPhotos {
  cardId: string
  pathToFile: string
}

interface ICardEmails {
  id: string
  email: string
  type?: string
  cardId: string
}

interface ICardPhones {
  id: string
  phone: string
  extention?: string
  type: string
  cardId: string
}

interface ICardCalendars {
  id: string
  label?: string
  title: string
  url: string
  cardId: string
}

interface ICardWebsites {
  id: string
  url: string
  description?: string
  cardId: string
}

interface ICardOfficeAddresses {
  id: string
  label?: string
  city: string
  streetAddress: string
  state?: string
  zipcode?: string
  cardId: string
}

interface ICardCalendars {
  id: string
  label?: string
  title: string
  url: string
  cardId: string
}

interface ICardSocialMedias {
  id: string
  platform: string
  handle?: string
  profileUrl: string
  label: string
  cardId: string
}

interface ICardAdditionalLinks {
  id: string
  url: string
  title: string
  typeContent: string
  description?: string
  cardId: string
}

interface ICardEducation {
  id: string
  academicLevel?: string
  schoolName: string
  startYear?: string
  graduationYear?: string
  academicFocus?: string
  degreeType?: string
  cardId: string
}

interface ICardAccolades {
  id: string
  title: string
  fromWho?: string
  startDate?: Date
  endDate?: Date
  cardId: string
}

interface ICardAchievements {
  id: string
  title: string
  issuedBy?: string
  startYear?: string
  issuedYear?: string
  description?: string
  cardId: string
}

interface ICardBusinessGoals {
  id: string
  status: string
  title: string
  percentComplete: number
  startDate?: Date
  endDate?: Date
  description?: string
  cardId: string
}

interface ICardBusinessNeeds {
  id: string
  date?: Date
  title: string
  description?: string
  status: string
  cardId: string
}

interface ICardServices {
  id: string
  type: string
  title: string
  subtitle?: string
  details?: string
  positioning: number
  cardId: string
}

interface ICardPortfolio {
  id: string
  image: string
  title?: string
  details?: string
  positioning: number
  cardId: string
}

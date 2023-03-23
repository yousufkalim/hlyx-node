export interface ICard {
  cardId: string
  userId: string
  publicCard: boolean
  templateID: string
  userAvatar: string
  coverPhoto?: string
  coverPhotos: ICardCoverPhotos[]
  companyIcon: string
  fullName: string
  emails?: ICardEmails[]
  phones?: ICardPhones[]
  calendar: string
  websites?: ICardWebsites[]
  country?: string
  city?: string
  state?: string
  streetAddress?: string
  zipcode?: string
  socialMedias?: ICardSocialMedias[]
  additionalLinks?: ICardAdditionalLinks[]
  about?: string
  company?: string
  profTitle?: string
  occupation?: string
  industry?: string
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

export interface IValidateCardFullName {
  fullName: string
}

export interface IValidateCardContactPage {
  emails?: ICardEmails[]
  phones?: ICardPhones[]
  calendar: string
  websites?: ICardWebsites[]
  country?: string
  city?: string
  state?: string
  streetAddress?: string
  zipcode?: string
  socialMedias?: ICardSocialMedias[]
  additionalLinks?: ICardAdditionalLinks[]
}

export interface IValidateCardAboutPage {
  about?: string
  company?: string
  profTitle?: string
  occupation?: string
  industry?: string
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

interface ICardWebsites {
  id: string
  url: string
  description?: string
  cardId: string
}

interface ICardSocialMedias {
  id: string
  platform: string
  handle: string
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

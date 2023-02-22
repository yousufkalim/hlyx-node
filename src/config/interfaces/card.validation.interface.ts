export interface ICard {
  urlPath: string
  userId: number
  userAvatar: string
  coverPhoto?: string
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
  needsAsks?: string[]
  hobbies?: string[]
  interests?: string[]
  skills?: string[]
  motto?: string
  services?: ICardServices[]
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

export interface IValidateCardPhoto {
  coverPhoto: string
}

export interface IValidateCardAllPhotos {
  allPhotos: string[]
}

interface ICardEmails {
  id: number
  email: string
  type?: string
  cardId: string
}

interface ICardPhones {
  id: number
  phone: string
  extention?: string
  type: string
  cardId: string
}

interface ICardWebsites {
  id: number
  website: string
  description: string
  cardId: string
}

interface ICardSocialMedias {
  id: number
  platform: string
  handle: string
  cardId: string
}

interface ICardAdditionalLinks {
  id: number
  website: string
  icon: string
  title: string
  description: string
  cardId: string
}
interface ICardEducation {
  id: number
  academicLevel: string
  schoolName: string
  graduationYear: string
  academicFocus: string
  degreeType: string
  cardId: string
}

interface ICardAccolades {
  id: number
  title: string
  fromWho: string
  startDate: Date
  endDate: Date
  cardId: string
}

interface ICardAchievements {
  id: number
  title: string
  issuedBy: string
  issuedYear: string
  cardId: string
}

interface ICardBusinessGoals {
  id: number
  status: string
  title: string
  subTitle: string
  percentComplete: number
  startDate: Date
  endDate: Date
  about: string
  cardId: string
}

interface ICardBusinessNeeds {
  id: string
  date: Date
  title: string
  subTitle: string
  status: string
  cardId: string
}

interface ICardServices {
  id: number
  type: string
  title: string
  subtitle: string
  icon: string
  details: string
  cardId: string
}

interface ICardPortfolio {
  id: number
  type: string
  image: string
  title: string
  subTitle: string
  cardId: string
}

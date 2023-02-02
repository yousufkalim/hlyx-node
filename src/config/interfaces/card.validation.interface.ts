export interface ICard {
  urlPath: string
  cardType: string
  userId: number
  userAvatar: string
  coverPhoto: string
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
  educationLevel?: string
  schoolName?: string
  academicFocus?: string
  degreeType?: string
  accolades?: string[]
  achievements?: ICardAchievements[]
  businessGoals?: string[]
  needsAsks?: string[]
  hobbies?: string[]
  interests?: string[]
  skills?: string[]
  motto?: string
  services: ICardServices[]
  portfolio: ICardPortfolio[]
  qrCode: string
}

export interface IValidateCardUpdate {
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
  educationLevel?: string
  schoolName?: string
  academicFocus?: string
  degreeType?: string
  accolades?: string[]
  achievements?: ICardAchievements[]
  businessGoals?: string[]
  needsAsks?: string[]
  hobbies?: string[]
  interests?: string[]
  skills?: string[]
  motto?: string
  services: ICardServices[]
}

export interface IValidateCardPhoto {
  coverPhoto: string
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

interface ICardAchievements {
  id: number
  title: string
  issuedBy: string
  issuedYear: string
  cardId: string
}

interface ICardServices {
  id: number
  title: string
  icon: string
  details: string
  cardId: string
}

interface ICardPortfolio {
  id: number
  cardId: string
}

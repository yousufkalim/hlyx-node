export interface IValidateUserUpdate {
  firstName?: string
  middleInitial?: string
  lastName?: string
  company?: string
  profTitle?: string
  industry?: string
  profRole?: string
  website?: string
  country?: string
  city?: string
  state?: string
  zipcode?: string
}

export interface IValidateUserPreference {
  twoFactorAuth?: TwoFactorAuth
  allCardsPrivate?: boolean
  connectionViaProfileLink?: boolean
  connectionViaQRCode?: boolean
  connectionViaPerson?: boolean
  connectionViaContacts?: boolean
}

export interface IValidateUserNotification {
  newLinkRequest?: boolean
  newMessage?: boolean
  groupMessages?: boolean
  profileShare?: boolean
  acceptedLinkRequest?: boolean
  accountSecurity?: boolean
}

export enum TwoFactorAuth {
  none,
  phoneTypes,
  email
}

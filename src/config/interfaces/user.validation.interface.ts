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
  twoFactorAuth: TwoFactorAuth
}

export enum TwoFactorAuth {
  none,
  phoneTypes,
  email
}

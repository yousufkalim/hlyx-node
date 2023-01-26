import { Timestamps, IProfession, ILocation } from './common.interface'

export interface IUser extends Timestamps {
  id: number
  name?: IUserName
  email: string
  phone?: string
  profileImage?: string
  password: string
  profession?: IProfession
  location?: ILocation
  cards?: number[]
  isEmailVerified: boolean
  isPhoneVerified: boolean
  termsAndConditions: boolean
  role: string
}

export interface IValidateUserUpdate {
  name: IValidateName
  phone: string
  profileImage: string
  profession: IProfession
  location: ILocation
}

export interface IValidateName {
  name: IUserName
}

export interface IValidateProfileImage {
  profileImage: string
}

interface IUserName {
  firstName: string
  middleInitial: string
  lastName: string
}

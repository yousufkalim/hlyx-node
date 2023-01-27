export interface IUser {
  id: number
  name?: IUserName
  email: string
  phone?: string
  profileImage?: string
  password: string
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

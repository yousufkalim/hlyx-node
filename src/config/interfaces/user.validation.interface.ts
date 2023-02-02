export interface IUser {
  id: number
}

export interface IValidateUserUpdate {
  firstName: string
  middleInitial: string
  lastName: string
  company: string
  profTitle: string
  industry: string
  profRole: string
  website: string
}

export interface IValidateProfileImage {
  profileImage: string
}

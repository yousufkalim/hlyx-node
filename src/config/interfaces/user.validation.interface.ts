export interface IUser {
  id: number
  email: string
  phone: string
  firstName: string
  role: string
}

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

export interface IValidateProfileImage {
  profileImage: string
}

export interface IValidateAllImages {
  allPhotos: string[]
}

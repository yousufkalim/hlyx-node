export interface IValidateContactRequest {
  cardId: string
  fullName: string
  company?: string
  jobTitle?: string
  phone: string
  email: string
  location?: string
  message?: string
}

export interface IValidateContactNote {
  notes?: string
}

export interface INewContactRequest {
  Contacts: {
    create: {
      fullName: string
      company?: string
      jobTitle?: string
      phone: string
      email: string
      location?: string
      message?: string
      contactImage?: string
    }
  }
}

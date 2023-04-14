export interface IValidateSharedContact {
  cardId: string
  fullName: string
  company?: string
  jobTitle?: string
  phone: string
  email: string
  location?: string
  message?: string
}

export interface IValidateContactSharedContact {
  notes?: string
}

export interface INewSharedContact {
  ShareContacts: {
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

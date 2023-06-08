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
      city?: string
      state?: string
      notes?: string
      message?: string
      contactImage?: string
    }
  }
}

export interface IContact {
  cardId: string
  contactId: string
  contactImage: string
  status: string
  fullName: string
  company: string
  jobTitle: string
  phone: string
  email: string
  state: string
  city: string
  message: string
  notes: string
  createdAt?: string
}

export interface IValidateContactSearchType {
  searchBy: string
}

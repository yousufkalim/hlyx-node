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

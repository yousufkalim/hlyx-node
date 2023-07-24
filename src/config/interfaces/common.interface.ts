import { IContact } from './contactRequest.validation.interface'
import { Request } from 'express'
import { ILinks } from './link.validation.interface'

export interface IUser {
  id: string
  email: string
  phone: string
  firstName: string
  role: string
}

export interface RequestUserAuth extends Request {
  user?: IUser
}

export interface RequestUserPreference extends RequestUserAuth {
  twoFactorAuth?: string
  allCardsPrivate?: boolean
  connectionViaProfileLink?: boolean
  connectionViaQRCode?: boolean
  connectionViaPerson?: boolean
}

export interface RequestLink extends RequestUserAuth {
  card?: {
    requester: string
    recipient: string
  }
  link?: ILinks
  sharedWith?: string[]
}

export interface RequestNotification extends Request {
  notification?: {
    cardId: string
    message?: string
    directsTo: string
    idDirectedTo: string
    idDirectedToOther?: string
    otherCardId?: string
    notificationType?: string
  }
}

export interface IidDirectedTo {
  userAvatar: string
  cardName: string
  fullName: string
}

export interface IEmail {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

export interface ISharedCard {
  directsTo: string
  sharedBy: any
  message?: string
}

export interface IProfile {
  id: string
  firstName: string
  middleInitial: string
  lastName: string
  company: string
  profileAvatar: string
  profTitle: string
  city: string
  state: string
  country: string
}

export interface ICreateNotification {
  notificationId?: string
  success: boolean
}

export interface ISearch {
  searchBy?: string
  search?: string
}

export interface IGeneralLinks {
  updatedAt: Date
  cardTwo: string
  cardOne: string
  id: string
}

export interface ICardContacts {
  myCardId: string
  contacts: IContact[] | []
}

export interface ISearchQuery {
  search: string
  searchBy: string
}

export interface IContactUser {
  id: string
  email: string
  userBio: IUserBio | null
}

export interface IUserBio {
  firstName: string
  middleInitial: string
  lastName: string
  profileAvatar: string
  phone: string
  profileType: string
}

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
}

export interface RequestNotification extends Request {
  notification?: {
    cardId: string
    message?: string
    directsTo: string
    idDirectedTo: string
  }
}

export interface IEmail {
  to: string
  from: string
  subject: string
  text: string
  html: string
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

import { Request } from 'express'
import { ILinks } from './link.interface'

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

export interface RequestLink extends RequestUserAuth {
  card?: {
    requester: string
    recipient: string
  }
  link?: ILinks
}

export interface IEmail {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

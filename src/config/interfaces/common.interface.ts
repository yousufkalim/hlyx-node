import { Request } from 'express'
import { IUser } from './user.validation.interface'

export interface RequestUserAuth extends Request {
  user?: IUser
}

export interface RequestLink extends RequestUserAuth {
  card?: string
}

export interface IEmail {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

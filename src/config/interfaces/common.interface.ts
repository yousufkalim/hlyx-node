import { Request } from 'express'
import { ICard } from './card.validation.interface'
import { IUser } from './user.validation.interface'

export interface RequestUserAuth extends Request {
  user?: IUser
}

export interface RequestUserCardAuth extends RequestUserAuth {
  card?: ICard
}

export interface IEmail {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

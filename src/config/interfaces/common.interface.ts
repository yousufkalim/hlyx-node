import { Request } from 'express'
import { ICard } from './card.validation.interface'
import { IUser } from './user.validation.interface'

export interface RequestUserAuth extends Request {
  user?: IUser
}

export interface RequestUserCardAuth extends RequestUserAuth {
  card?: ICard
}

export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

export interface IUserUpdate {
  isTokenExpired: boolean
  password?: string
}

export interface IEmail {
  to: string
  from: string
  subject: string
  text: string
  html: string
}

export interface IProfession {
  company: string
  professionalTitle: string
  industry: string
}

export interface ILocation {
  country?: string
  city?: string
  state?: string
  zipcode?: string
}

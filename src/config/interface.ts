import { Request } from 'express'

export interface IUser {
  firstName: string
  middleName: string
  lastName: string
  role: string
  email: string
  phoneNumber: string
  iat: number
  exp: number
}

export interface RequestUserAuth extends Request {
  user?: IUser
}

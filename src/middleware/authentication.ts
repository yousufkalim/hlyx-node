import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { RequestUserAuth } from '../config/interfaces/common.interface'
import { config } from '../config/env.config.validations'

export const authenticate = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  // Get token from the header
  const token = req.header(messages?.AUTHORIZATION)

  // Check if no token
  if (!token) {
    return res.status(401).json({
      code: codes.UNAUTHORIZED,
      message: messages.NO_TOKEN
    })
  }
  // verify token
  try {
    const decoded: any = jwt.verify(token, config.get('jwt_secret_key') as string)
    req.user = decoded.user
    next()
  } catch (err) {
    console.error(err)
    return res.status(401).json({
      code: codes.UNAUTHORIZED,
      message: messages.INVALID_TOKEN
    })
  }
}

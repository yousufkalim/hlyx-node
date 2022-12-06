import { Response, NextFunction } from 'express'
import { messages } from '../config/messages'
import { roles } from '../config/roles'
import { codes } from '../config/codes'
import { RequestUserAuth } from '../config/interface'

export const adminAuthorization = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  // Check for the admin role
  if (req?.user?.role === roles.ADMIN) {
    next()
  } else {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.ACCESS_DENIED
    })
  }
}

export const workerAuthorization = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  // Check for the user role
  if (req?.user?.role === roles.WORKER) {
    next()
  } else {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.ACCESS_DENIED
    })
  }
}

export const providerAuthorization = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  // Check for the user role
  if (req?.user?.role === roles.PROVIDER) {
    next()
  } else {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.ACCESS_DENIED
    })
  }
}

import { Response, NextFunction } from 'express'
import { messages } from '../config/messages'
import { roles } from '../config/roles'
import { codes } from '../config/codes'
import { RequestUserAuth } from '../config/interfaces/common.interface'

export const userAuthorization = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  // Check for the admin role
  if (req.user?.role === roles.ADMIN ||
      req.user?.id === parseInt(req.params?.id)) {
    next()
  } else {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.ACCESS_DENIED
    })
  }
}

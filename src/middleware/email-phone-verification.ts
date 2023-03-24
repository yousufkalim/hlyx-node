import { Response, NextFunction } from 'express'
import { messages } from '../config/messages'
import { codes } from '../config/codes'
import { RequestUserAuth } from '../config/interfaces/common.interface'
import { db } from '../utils/db'

export const emailPhoneVerified = async (req: RequestUserAuth, res: Response, next: NextFunction): Promise<any> => {
  // Verify user exists
  const user = await db.userAuth.findUnique({
    where: {
      id: req.user?.id
    },
    select: {
      isEmailVerified: true,
      isPhoneVerified: true
    }
  })
  if (!user) {
    return res.status(404).json({
      code: codes.NOT_FOUND,
      message: messages.USER_NOT_FOUND
    })
  }
  // Check Email is Verified
  if (!user.isEmailVerified) {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.EMAIL_NOT_VERIFIED
    })
  }
  // Check Phone is Verified
  if (!user.isPhoneVerified) {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.PHONE_NOT_VERIFIED
    })
  }
  next()
}

import { Response, NextFunction } from 'express'
import { messages } from '../config/messages'
import { roles } from '../config/roles'
import { codes } from '../config/codes'
import { RequestUserAuth, RequestLink } from '../config/interfaces/common.interface'
import { db } from '../utils/db'

export const userAuthorization = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  console.log(req.user?.id)
  console.log(req.params?.id)

  if (req.user?.role === roles.SUPER_ADMIN ||
      req.user?.id === req.params?.id) {
    next()
  } else {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.ACCESS_DENIED
    })
  }
}

export const adminAuthorization = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  if (req.user?.role === roles.SUPER_ADMIN) {
    next()
  } else {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.ACCESS_DENIED
    })
  }
}

export const cardAuthorization = async (req: RequestLink, res: Response, next: NextFunction): Promise<any> => {
  // Verify card exists
  const card = await db.card.findUnique({ where: { cardId: req.params.cardId } })
  if (card === null) {
    return res.status(404).json({
      code: codes.NOT_FOUND,
      message: messages.CARD_NOT_FOUND
    })
  }
  if (card.userId === req.user?.id || req.user?.role === roles.SUPER_ADMIN) {
    next()
  } else {
    return res.status(403).json({
      code: codes.FORBIDDEN,
      message: messages.ACCESS_DENIED
    })
  }
}

export const linkAuthorization = async (req: RequestLink, res: Response, next: NextFunction): Promise<any> => {
  if (req.body.cardOne != null || req.body.cardTwo != null) {
    // Verify Cards exist
    const foundCardOne = await db.card.findUnique({ where: { cardId: req.body.cardOne } })
    const foundCardTwo = await db.card.findUnique({ where: { cardId: req.body.cardTwo } })
    if (foundCardOne === null || foundCardTwo === null) {
      return res.status(404).json({
        code: codes.NOT_FOUND,
        message: messages.CARD_NOT_FOUND
      })
    }
    // Verify logged in user owns one of the cards
    if (foundCardOne.userId !== req.user?.id || foundCardTwo.userId !== req.user?.id) {
      return res.status(403).json({
        code: codes.FORBIDDEN,
        message: messages.ACCESS_DENIED
      })
    }

    // Discover which card is making the request and set req.card
    if (foundCardOne.userId === req.user?.id) {
      req.card = 'one'
    } else if (foundCardTwo.userId === req.user?.id) {
      req.card = 'two'
    }
    next()
  }
}

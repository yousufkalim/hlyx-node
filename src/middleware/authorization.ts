import { Response, NextFunction } from 'express'
import { messages } from '../config/messages'
import { roles } from '../config/roles'
import { codes } from '../config/codes'
import { RequestUserAuth, RequestLink } from '../config/interfaces/common.interface'
import { db } from '../utils/db'

export const userAuthorization = (req: RequestUserAuth, res: Response, next: NextFunction): any => {
  if (req.user?.role === roles.SUPER_ADMIN ||
      req.user?.id === req.params?.userId) {
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

export const cardAuthorization = async (req: RequestUserAuth, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Verify card exists
    const card = await db.card.findUnique({ where: { cardId: req.params.cardId } })
    if (!card) {
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
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
  }
}

export const linkAuthorization = async (req: RequestLink, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Verify Link exists
    const link = await db.link.findUnique({
      where: {
        id: req.params.linkId
      },
      include: {
        photos: true
      }
    })
    if (!link) {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.LINK_NOT_FOUND
      })
    }
    // Set req.link
    req.link = link

    // Find Cards Associated with logged in user
    const cards = await db.userBio.findUnique({
      where: {
        id: req.user?.id
      },
      select: {
        cards: {
          select: {
            cardId: true
          }
        }
      }
    })
    if (!cards) {
      return res.status(404).json({
        code: codes.NOT_FOUND,
        message: messages.CARD_NOT_FOUND
      })
    }

    const cardIds = cards.cards.map(element => element.cardId)

    // Discover which card is making the request and set req.card
    if (cardIds.includes(link.cardOne)) {
      req.card = {
        requester: link.cardOne,
        recipient: link.cardTwo
      }
    } else if (cardIds.includes(link.cardTwo)) {
      req.card = {
        requester: link.cardTwo,
        recipient: link.cardOne
      }
    } else {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.LINK_UNAUTHORIZED
      })
    }
    next()
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
  }
}

export const noteAuthorization = async (req: RequestUserAuth, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Verify Note Exists
    const existingNote = await db.linkNotes.findUnique({
      where: {
        id: req.params.noteId
      },
      include: {
        Link: {
          include: {
            CardOneRef: {
              select: {
                userId: true,
                cardId: true
              }
            },
            CardTwoRef: {
              select: {
                userId: true,
                cardId: true
              }
            }
          }
        }
      }
    })
    if (!existingNote) {
      return res.status(404).json({
        code: codes.NOT_FOUND,
        message: messages.NOTE_NOT_FOUND
      })
    }

    // Verify User Matches
    if ((req.user?.id !== existingNote.Link.CardOneRef.userId && existingNote.Link.CardTwoRef.cardId !== existingNote.authorId) ||
        (req.user?.id !== existingNote.Link.CardTwoRef.userId && existingNote.Link.CardOneRef.cardId !== existingNote.authorId)) {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.NOTE_UNAUTHORIZED
      })
    }

    // Verify Link Status
    if (existingNote.Link.status !== 'accepted') {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.NOTE_NOT_ACCEPTED
      })
    }
    next()
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
  }
}

export const notificationAuthorization = async (req: RequestUserAuth, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Verify Notifcation Exists
    const notification = await db.notification.findUnique({ where: { notificationId: req.params.notificationId } })
    if (!notification) {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.CONTACT_NOT_FOUND
      })
    }

    // Verify Notification Belongs to Authenticated User
    const card = await db.card.findUnique({
      where: {
        cardId: notification.cardId
      },
      select: {
        userId: true
      }
    })

    if (!card) {
      throw Error(messages.CONTACT_OUT_OF_SYNC)
    }

    if (card.userId !== req.user?.id) {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.NOTIFICATION_UNAUTHORIZED
      })
    }
    next()
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
  }
}

export const sharedContactAuthorization = async (req: RequestUserAuth, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Verify Contact Exists
    const contact = await db.contact.findUnique({ where: { contactId: req.params.contactId } })
    if (!contact) {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.CONTACT_NOT_FOUND
      })
    }

    // Verify Contact Belongs to Authenticated User
    const card = await db.card.findUnique({
      where: {
        cardId: contact.cardId
      },
      select: {
        userId: true
      }
    })

    if (!card) {
      throw Error(messages.CONTACT_OUT_OF_SYNC)
    }

    if (card.userId !== req.user?.id) {
      return res.status(400).json({
        code: codes.BAD_REQUEST,
        message: messages.CONTACT_UNAUTHORIZED
      })
    }
    next()
  } catch (error: any) {
    console.error(error)
    return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
  }
}

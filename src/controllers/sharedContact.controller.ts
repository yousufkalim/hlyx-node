import { Request, Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { sharedContactControllerParams } from '../config/params'
import { validateSharedContactCreate, validateSharedContactNote } from '../utils/validations/sharedContact.controller.validation'
import { sharedContactStatus } from '../config/enumTypes'

import BaseController from './base.controller'
import { db } from '../utils/db'

class SharedContactController extends BaseController {
  create = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, sharedContactControllerParams)
    const { fullName, company, jobTitle, phone, email, location, message } = params
    try {
      // Validate input
      const validationError = validateSharedContactCreate(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify card exists
      const card = await db.card.findUnique({ where: { cardId: params.cardId } })
      if (!card) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Create shared contact and return
      const sharedContact = await db.card.update({
        where: {
          cardId: params.cardId
        },
        data: {
          ShareContacts: {
            create: {
              fullName,
              company,
              jobTitle,
              phone,
              email,
              location,
              message
            }
          }
        },
        select: {
          ShareContacts: {
            select: {
              contactId: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      })

      return res.status(200).json({
        contactId: sharedContact.ShareContacts[0].contactId,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  getActive = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true,
          ShareContacts: {
            where: {
              status: 'active'
            }
          }
        }
      })

      return res.status(200).json({
        cards,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  getArchived = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true,
          ShareContacts: {
            where: {
              status: 'archived'
            }
          }
        }
      })

      return res.status(200).json({
        cards,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  updateStatus = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Validate input
      const status = req.body.status
      if (!sharedContactStatus.includes(status)) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_LINK_STATUS
        })
      }

      // Update and return
      const contact = await db.sharedContact.update({
        where: {
          contactId: req.params.contactId
        },
        data: {
          status
        }
      })

      return res.status(200).json({
        contact,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  updateNote = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, sharedContactControllerParams)
    const { notes } = params
    try {
      // Validate input
      const validationError = validateSharedContactNote(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Update and return
      const contact = await db.sharedContact.update({
        where: {
          contactId: req.params.contactId
        },
        data: {
          notes
        }
      })

      return res.status(200).json({
        contact,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  deleteContact = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Delete and Return
      await db.sharedContact.delete({ where: { contactId: req.params.contactId } })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new SharedContactController()

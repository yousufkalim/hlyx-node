import { Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { sharedContactControllerParams } from '../config/params'
import { validateSharedContactCreate } from '../utils/validations/sharedContact.controller.validation'

import BaseController from './base.controller'
import { db } from '../utils/db'

class SharedContactController extends BaseController {
  create = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, sharedContactControllerParams)
    const { fullName, company, jobTitle, phone, email, message } = params
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
          ShareContact: {
            create: {
              fullName,
              company,
              jobTitle,
              phone,
              email,
              message
            }
          }
        },
        include: {
          ShareContact: {
            select: {
              id: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      })
      return res.status(200).json({
        sharedContactId: sharedContact.ShareContact[0].id,
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

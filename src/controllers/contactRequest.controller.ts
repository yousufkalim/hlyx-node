import { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload'

import { RequestNotification, RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { sharedContactControllerParams } from '../config/params'
import { validateSharedContactCreate, validateSharedContactNote } from '../utils/validations/contactRequest.controller.validation'
import { INewContactRequest } from '../config/interfaces/contactRequest.validation.interface'
import { sharedContactStatus } from '../config/enumTypes'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { awsUploadFile } from '../utils/aws-image'

import BaseController from './base.controller'
import notificationController from './notification.controller'
import { db } from '../utils/db'

class ContactRequestController extends BaseController {
  // Create new contact request
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

      // Verify Card is Public
      if (!card.publicCard) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.CARD_NOT_PUBLIC
        })
      }

      const data: INewContactRequest = {
        Contacts: {
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
      }

      // Handle Image
      if (req.files) {
        const file = req.files.contactImage as UploadedFile
        if (!file) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: `${messages.INVALID_FILE_LABEL} contactImage`
          })
        }
        // Verify Acceptable MIME Type
        if (!ACCEPTABLE_MIME_TYPES.includes(file.mimetype)) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_MIME_TYPE
          })
        }
        // Verify Image Size
        if (file.size > MAX_BYTES) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.FILE_SIZE_OVER_10
          })
        }
        // AWS API Call
        const contactImage = await awsUploadFile(file.data, req.params.userId, 'profile-photo', file.name, file.mimetype)

        data.Contacts.create.contactImage = contactImage
      }

      // Create shared contact and return
      const contactRequest = await db.card.update({
        where: {
          cardId: params.cardId
        },
        data,
        select: {
          Contacts: {
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

      const contactId = contactRequest.Contacts[0].contactId

      // Create notification
      const reqNotification: RequestNotification = req
      reqNotification.notification = {
        cardId: params.cardId,
        directsTo: 'contactRequest',
        message,
        idDirectedTo: contactId
      }

      const notification = await notificationController.createNotification(req, res)
      if (notification.statusCode !== 200) {
        throw Error(messages.NOTIFICATION_CREATE_CALLED_INCORRECTLY)
      }

      return res.status(200).json({
        contactId,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Get all requested contact requests
  getRequested = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true,
          Contacts: {
            where: {
              status: 'requested'
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

  // Get all saved contact requests
  getSaved = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true,
          Contacts: {
            where: {
              status: 'saved'
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

  // Get all archived contact requests
  getArchived = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true,
          Contacts: {
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
      const contact = await db.contact.update({
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
      const contact = await db.contact.update({
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
      await db.contact.delete({ where: { contactId: req.params.contactId } })
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

export default new ContactRequestController()

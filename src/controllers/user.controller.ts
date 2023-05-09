import {
  validateCardAboutPage,
  validateCardContactPage
} from './../utils/validations/card.controller.validation'
import { Response } from 'express'
import { UploadedFile } from 'express-fileupload'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { cardControllerParams, userControllerParams } from '../config/params'
import { validateUserUpdate } from '../utils/validations/user.controller.validation'
import { arrayLimits } from '../config/arrayLimits'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { awsDeleteFile, awsUploadFile } from '../utils/aws-image'

import BaseController from './base.controller'
import { db } from '../utils/db'

class UserController extends BaseController {
  // Return logged in User's Bio
  me = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({
        where: {
          id: req.user?.id
        },
        include: {
          _count: {
            select: {
              cards: true
            }
          },
          cards: {
            select: {
              cardId: true
            }
          }
        }
      })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }
      // Return
      return res.status(200).json({
        user,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update user
  updateBio = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    try {
      // Validate input
      const validationError = validateUserUpdate(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      if (req.files) {
        const file = req.files.profileImage as UploadedFile
        if (!file) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: `${messages.INVALID_FILE_LABEL} profileImage`
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
        const pathToFile = await awsUploadFile(
          file.data,
          req.params.userId,
          'profile-photo',
          file.name,
          file.mimetype
        )
        // Prepare params for update
        params.profileAvatar = pathToFile
        params.profilePhotos = {
          create: {
            pathToFile
          }
        }
      }
      // Set onboarding to true
      params.isOnBoardingComplete = true

      // Update UserBio and return
      await db.userBio.update({
        where: { id: req.params.userId },
        data: params
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Set active profile avatar (pathToFile should already be a file within our database)
  updateProfileAvatar = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { pathToFile } = req.body
    try {
      if (!pathToFile) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'pathToFile required'
        })
      }

      // Verify user / photo exists
      const image = await db.userPhoto.findUnique({
        where: {
          userId_pathToFile: {
            userId: req.params.userId,
            pathToFile
          }
        }
      })
      if (!image) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.IMAGE_NOT_FOUND
        })
      }

      // Update and return
      await db.userBio.update({
        where: { id: req.params.userId },
        data: {
          profileAvatar: pathToFile
        }
      })

      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Add a card to user
  addCard = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      const params = this.filterParams(req.body, cardControllerParams)
      const { fullName, cardName, profTitle, profileLayout, city, company, industry, occupation } =
        params
      // Verify user exists
      const user = await db.userBio.findUnique({
        where: {
          id: req.params.userId
        },
        include: {
          cards: true
        }
      })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      if (!user.isOnBoardingComplete) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.ONBOARDING_INCOMPLETE
        })
      }

      // Verify under maximum amount of Cards
      const cards = await db.card.findMany({ where: { userId: req.params.userId } })
      if (cards.length >= arrayLimits.MAX_CARDS) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_CARD_LIMIT
        })
      }

      // Card About Data
      const cardAboutData: any = {
        company,
        profTitle,
        industry,
        occupation
      }

      // Create Card data
      const cardContactData: any = {
        fullName,
        cardName,
        city,
        profileLayout,
        country: user.country ?? undefined,
        state: params?.state ?? undefined,
        zipcode: params.zipcode ?? undefined,
        emails: params.emails,
        phones: params.phones,
        websites: params.websites,
        officeAddresses: params.officeAddresses,
        socialMedias: params.socialMedias,
        additionalLinks: params.additionalLinks,
        calendars: params.calendars
      }

      const cardContactValidationError = validateCardContactPage(cardContactData)
      if (cardContactValidationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: cardContactValidationError
        })
      }

      const cardAboutValidationError = validateCardAboutPage(cardAboutData)
      if (cardAboutValidationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: cardAboutValidationError
        })
      }

      // Add optional fields if set
      if (params.emails?.length > 0) {
        cardContactData.emails = {
          createMany: {
            data: params.emails
          }
        }
      }
      if (params.phones?.length > 0) {
        cardContactData.phones = {
          createMany: {
            data: params.phones
          }
        }
      }
      if (params.calendars?.length > 0) {
        cardContactData.calendars = {
          createMany: {
            data: params.calendars
          }
        }
      }
      if (params.websites?.length > 0) {
        cardContactData.websites = {
          createMany: {
            data: params.websites
          }
        }
      }
      if (params.officeAddresses?.length > 0) {
        cardContactData.officeAddresses = {
          createMany: {
            data: params.officeAddresses
          }
        }
      }
      if (params.socialMedias?.length > 0) {
        cardContactData.socialMedias = {
          createMany: {
            data: params.socialMedias
          }
        }
      }
      if (params.additionalLinks?.length > 0) {
        cardContactData.additionalLinks = {
          createMany: {
            data: params.additionalLinks
          }
        }
      }

      /*  ====  Validation for Cover Photo  ===== */
      const coverPhoto = req.files?.coverPhoto as UploadedFile
      if (coverPhoto) {
        // Verify Acceptable MIME Type
        if (!ACCEPTABLE_MIME_TYPES.includes(coverPhoto.mimetype)) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_MIME_TYPE
          })
        }
        // Verify Image Size
        if (coverPhoto.size > MAX_BYTES) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.FILE_SIZE_OVER_10
          })
        }

        // AWS API Call
        const coverPhotoPath = await awsUploadFile(
          coverPhoto.data,
          req.body.id,
          'cover-photo',
          coverPhoto.name,
          coverPhoto.mimetype
        )
        cardAboutData.coverPhoto = coverPhotoPath
      }

      /*  ====  Validation for Company Icon  ===== */
      const companyIcon = req.files?.companyIcon as UploadedFile
      if (companyIcon) {
        // Verify Acceptable MIME Type
        if (!ACCEPTABLE_MIME_TYPES.includes(companyIcon.mimetype)) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_MIME_TYPE
          })
        }
        // Verify Image Size
        if (companyIcon.size > MAX_BYTES) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.FILE_SIZE_OVER_10
          })
        }

        const companyIconPath = await awsUploadFile(
          companyIcon.data,
          req.body.id,
          'company-icon',
          companyIcon.name,
          companyIcon.mimetype
        )

        cardAboutData.companyIcon = companyIconPath
      }

      const data = { ...cardContactData, ...cardAboutData }

      // Update UserBio, create Card, and return
      const createdCard = await db.userBio.update({
        where: { id: req.params.userId },
        data: {
          cards: {
            create: data
          }
        },
        select: {
          cards: {
            select: {
              cardId: true
            }
          }
        }
      })

      const allCardIds = user.cards.map((a) => a.cardId)
      let cardId = ''
      // Isolate newly create id from previous
      for (const id of createdCard.cards) {
        if (!allCardIds.includes(id.cardId)) {
          cardId = id.cardId
        }
      }
      return res.status(200).json({
        cardId,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Adds new Profile Photo
  addProfilePhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      if (!req.files) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.FILE_REQUIRED
        })
      }

      const file = req.files.profileImage as UploadedFile
      if (!file) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.INVALID_FILE_LABEL} profileImage`
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
      const pathToFile = await awsUploadFile(
        file.data,
        req.params.userId,
        'profile-photo',
        file.name,
        file.mimetype
      )

      const data: any = {
        profilePhotos: {
          create: {
            pathToFile
          }
        }
      }
      // Check if make makeAvatar is true
      if (req.body.makeAvatar === 'true') {
        data.profileAvatar = pathToFile
      }

      // Update and return
      await db.userBio.update({
        where: { id: req.params.userId },
        data
      })
      return res.status(200).json({
        pathToFile,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Delete Profile Photo
  deleteProfilePhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { pathToFile } = req.body
    try {
      if (!pathToFile) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'pathToFile required'
        })
      }

      // Verify user / photo exists
      const image = await db.userPhoto.findUnique({
        where: {
          userId_pathToFile: {
            userId: req.params.userId,
            pathToFile
          }
        }
      })
      if (!image) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.IMAGE_NOT_FOUND
        })
      }

      // AWS Call
      const key = req.body.pathToFile.split('/').pop()
      const result = await awsDeleteFile(key)

      // Update and return
      if (result) {
        await db.userPhoto.delete({
          where: {
            userId_pathToFile: {
              userId: req.params.userId,
              pathToFile
            }
          }
        })
      } else {
        throw Error('AWS and database not in sync')
      }

      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Find all photos associated with logged in user
  findProfilePhotos = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Grab images and return
      const images = await db.userBio.findMany({
        where: {
          id: req.params.userId
        },
        select: {
          _count: {
            select: {
              profilePhotos: true
            }
          },
          profilePhotos: {
            select: {
              pathToFile: true
            }
          }
        }
      })
      return res.status(200).json({
        images,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new UserController()

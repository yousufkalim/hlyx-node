/* eslint-disable @typescript-eslint/indent */
import {
  validateCardAboutForMinimal,
  validateCardContactPage,
  validateCardType
} from './../utils/validations/card.controller.validation'
import { Response } from 'express'
import { UploadedFile } from 'express-fileupload'

import { RequestUserAuth, RequestUserPreference } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import {
  cardControllerParams,
  userControllerParams,
  userNotificationParams,
  userPreferenceParams
} from '../config/params'
import {
  validateUserNotification,
  validateUserPreferences,
  validateUserUpdate
} from '../utils/validations/user.controller.validation'
import { arrayLimits } from '../config/arrayLimits'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { awsDeleteFile, awsUploadFile } from '../utils/aws-image'
import QRCode from 'qrcode'

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
          groups: true,
          cards: true,
          blockedUsers: true
        }
      })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      const userPreferences = await db.userAuth.findUnique({
        where: {
          id: req.user?.id
        },
        select: {
          isPhoneVerified: true,
          userBio: {
            select: {
              phone: true
            }
          },
          userPreference: {
            select: {
              twoFactorAuth: true,
              allCardsPrivate: true,
              connectionViaProfileLink: true,
              connectionViaQRCode: true,
              connectionViaPerson: true,
              connectionViaContacts: true
            }
          },
          userNotification: true
        }
      })

      const data = { ...user, phone: userPreferences?.userBio?.phone, userPreferences }
      // Return
      return res.status(200).json({
        user: data,
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

  // get User by UserName
  getUserByUserName = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      const user = await db.userBio.findUnique({
        where: {
          userName: req.params?.userName
        },
        select: {
          id: true,
          userName: true,
          firstName: true,
          lastName: true,
          company: true,
          country: true,
          city: true,
          profileAvatar: true,
          profTitle: true,
          industry: true
        }
      })
      if (!user) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.USER_NOT_FOUND
        })
      }

      return res.status(200).json({
        user,
        code: codes.OK,
        messages: messages.SUCCESS
      })
    } catch (error: any) {
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update user
  updateBio = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    try {
      // Get User details
      const userBio = await db.userBio.findUnique({
        where: {
          id: req.params.userId
        },
        select: {
          id: true,
          userName: true,
          firstName: true,
          lastName: true
        }
      })

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

      if (!userBio?.userName) {
        const randomNumber = userBio?.id?.split('-')[0]
        const userName = `${params.firstName?.toLowerCase()}-${params.lastName?.toLowerCase()}-${randomNumber}`
        params.userName = userName
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
      const body: any = {}
      for (const item in req.body) {
        try {
          body[item] = JSON.parse(req.body[item])
        } catch (err) {
          body[item] = req.body[item]
        }
      }

      const params = this.filterParams(body, cardControllerParams)
      const {
        fullName,
        cardName,
        profTitle,
        profileLayout,
        city,
        company,
        industry,
        occupation,
        emails,
        phones,
        zipcode,
        state,
        websites,
        officeAddresses,
        socialMedias,
        additionalLinks,
        calendars
      } = params
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
        country: user?.country ?? undefined,
        state: state ?? undefined,
        zipcode: zipcode ?? undefined,
        emails,
        phones,
        websites,
        officeAddresses,
        socialMedias,
        additionalLinks,
        calendars
      }

      const cardTypeError = validateCardType({ profileLayout })
      if (cardTypeError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: cardTypeError
        })
      }
      const cardContactValidationError = validateCardContactPage(cardContactData)
      if (cardContactValidationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: cardContactValidationError
        })
      }

      if (profileLayout === 'minimal') {
        const cardAboutValidationError = validateCardAboutForMinimal(cardAboutData)
        if (cardAboutValidationError) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: cardAboutValidationError
          })
        }
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
        cardContactData.coverPhoto = coverPhotoPath
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

        cardContactData.companyIcon = companyIconPath
      }

      /*  ====  Validation for Branded Cover Photo  ===== */
      const brandedCover = req.files?.brandedCoverPhoto as UploadedFile
      if (brandedCover) {
        // Verify Acceptable MIME Type
        if (!ACCEPTABLE_MIME_TYPES.includes(brandedCover.mimetype)) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_MIME_TYPE
          })
        }
        // Verify Image Size
        if (brandedCover.size > MAX_BYTES) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.FILE_SIZE_OVER_10
          })
        }

        const brandCoverPath = await awsUploadFile(
          brandedCover.data,
          req.body.id,
          'company-icon',
          brandedCover.name,
          brandedCover.mimetype
        )
        cardContactData.brandedCoverPhoto = brandCoverPath
      }

      const data = { ...cardContactData, ...cardAboutData, profileLayout }

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

      // Create QR Code and Add
      const urlRoute = 'https://hlyx.me/' + cardId
      const bufferImage = await QRCode.toBuffer(urlRoute, {
        type: 'png',
        width: 200,
        errorCorrectionLevel: 'H'
      })
      const qrCodeImage = await awsUploadFile(bufferImage, cardId, 'qrcode', '', 'image/png')

      await db.card.update({
        where: {
          cardId
        },
        data: {
          qrCodeImage
        }
      })

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

  updateSettings = async (req: RequestUserPreference, res: Response): Promise<Response> => {
    try {
      const user = await db.userAuth.findUnique({
        where: { id: req.params?.userId },
        select: {
          userPreference: true,
          id: true
        }
      })

      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }
      const params = this.filterParams(req.query, userPreferenceParams)
      const validationError = validateUserPreferences(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      const options = Object.keys(params)
      if (options?.length === 0) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.USER_SETTING_VALIDATE
        })
      }
      if (options?.length > 1) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.USER_SETTING_SINGLE_OPTION
        })
      }
      const value = params[options[0]]
      const key = options[0]

      if (key === 'personFilter' && !user.userPreference?.connectionViaPerson) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.USER_SETTING_PERSON_FILTER
        })
      }

      // Change all cards privacy of user
      if (key === 'allCardsPrivate' && user) {
        if (JSON.parse(value)) {
          await db.card.updateMany({
            where: { userId: user.id },
            data: {
              publicCard: false
            }
          })
        } else {
          await db.card.updateMany({
            where: { userId: user.id },
            data: {
              publicCard: true
            }
          })
        }
      }

      const data =
        key === 'twoFactorAuth'
          ? { twoFactorAuth: value }
          : key === 'connectionViaPerson'
          ? {
              [key]: JSON.parse(value),
              connectionViaProfileLink: false,
              connectionViaQRCode: false
            }
          : key === 'connectionViaProfileLink' || key === 'connectionViaQRCode'
          ? {
              [key]: JSON.parse(value),
              connectionViaPerson: false
            }
          : { [key]: JSON.parse(value) }
      // const getData = (): any => {
      //   let finalData = {}
      //   if (key === 'twoFactorauth') {
      //     finalData = {
      //       [key]: value
      //     }
      //   }
      //   // Disable both if connectionViaPerson option toggle
      //   if (key === 'connectionViaPerson') {
      //     finalData = {
      //       [key]: JSON.parse(value),
      //       connectionViaProfileLink: false,
      //       connectionViaQRCode: false
      //     }
      //   }
      //   // Disable connectionViaPerson if any of followig options toggle
      //   if (key === 'connectionViaProfileLink' || key === 'connectionViaQRCode') {
      //     finalData = {
      //       [key]: JSON.parse(value),
      //       connectionViaPerson: false
      //     }
      //   } else {
      //     // Parse the boolean value
      //     finalData = {
      //       [key]: JSON.parse(value)
      //     }
      //   }
      //   return finalData
      // }
      // const data = getData()
      const userPreferences = await db.userAuth.update({
        where: { id: req.params.userId },
        data: {
          userPreference: {
            update: data
          }
        },
        select: {
          userPreference: {
            select: {
              twoFactorAuth: true,
              allCardsPrivate: true,
              connectionViaProfileLink: true,
              connectionViaQRCode: true,
              connectionViaPerson: true,
              connectionViaContacts: true
            }
          }
        }
      })
      return res.status(200).json({
        data: userPreferences.userPreference,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }

  updateNotificationSetting = async (
    req: RequestUserPreference,
    res: Response
  ): Promise<Response> => {
    try {
      const user = await db.userAuth.findUnique({ where: { id: req.params?.userId } })

      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }
      const params = this.filterParams(req.body, userNotificationParams)

      const validationError = validateUserNotification(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      await db.userAuth.update({
        where: { id: req.params.userId },
        data: {
          userNotification: {
            update: params
          }
        }
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }

  userStats = async (req: RequestUserAuth, res: Response): Promise<Response> => {
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
          groups: true,
          cards: {
            select: {
              cardId: true,
              cardName: true,
              fullName: true,
              headerPhoto: true,
              coverPhoto: true,
              brandedCoverPhoto: true
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

      const linkedCards = []
      let linkRequests: any[] = []
      const savedContacts = []
      if (user.cards) {
        for (const card of user.cards) {
          const links = await db.link.findMany({
            where: {
              status: 'accepted',
              OR: [
                {
                  cardOne: card.cardId
                },
                {
                  cardTwo: card.cardId
                }
              ]
            },
            select: {
              linkedAt: true,
              CardOneRef: {
                select: {
                  cardId: true,
                  coverPhoto: true,
                  cardName: true,
                  fullName: true,
                  headerPhoto: true,
                  brandedCoverPhoto: true,
                  Contacts: {
                    select: {
                      contactImage: true,
                      status: true,
                      fullName: true,
                      company: true,
                      jobTitle: true,
                      createdAt: true
                    }
                  }
                }
              },
              CardTwoRef: {
                select: {
                  cardId: true,
                  coverPhoto: true,
                  cardName: true,
                  fullName: true,
                  headerPhoto: true,
                  brandedCoverPhoto: true,
                  Contacts: {
                    select: {
                      contactImage: true,
                      status: true,
                      fullName: true,
                      company: true,
                      jobTitle: true,
                      createdAt: true
                    }
                  }
                }
              }
            }
          })

          if (links) {
            // collect linked cards with my card
            for (const link of links) {
              if (link.CardOneRef.cardId === card.cardId) {
                linkedCards.push(link)
                savedContacts.push(...link.CardOneRef.Contacts)
              } else {
                linkedCards.push(link)
                savedContacts.push(...link.CardTwoRef.Contacts)
              }
            }
          }

          // Active Incoming Requests
          linkRequests = linkRequests.concat(
            await db.link.findMany({
              where: {
                status: 'requested',
                recentChangeBy: {
                  not: card.cardId
                },
                OR: [
                  {
                    cardOne: card.cardId
                  },
                  {
                    cardTwo: card.cardId
                  }
                ]
              }
            })
          )

          // Accepted Incoming Request by User
          linkRequests = linkRequests.concat(
            await db.link.findMany({
              where: {
                status: 'accepted',
                recentChangeBy: card.cardId,
                OR: [
                  {
                    cardOne: card.cardId
                  },
                  {
                    cardTwo: card.cardId
                  }
                ]
              }
            })
          )
        }
      }

      // Percent Increases
      const currentTime = new Date()
      const millisecondsInDay = 60 * 60 * 24 * 1000

      const dates = {
        oneWeekAgo: new Date(currentTime.getTime() - (7 * millisecondsInDay)),
        thirtyDaysAgo: new Date(currentTime.getTime() - (30 * millisecondsInDay)),
        oneYearAgo: new Date(currentTime.getTime() - (365 * millisecondsInDay))
      }

      // Grab filtered data
      const filteredLinks = {
        pastWeek: linkedCards.filter(link => link.linkedAt && link.linkedAt > dates.oneWeekAgo).length,
        pastMonth: linkedCards.filter(link => link.linkedAt && link.linkedAt > dates.thirtyDaysAgo).length,
        pastYear: linkedCards.filter(link => link.linkedAt && link.linkedAt > dates.oneYearAgo).length
      }

      const filteredLinkRequests = {
        pastWeek: linkRequests.filter(linkRequest => linkRequest.status === 'requested' && linkRequest.updatedAt > dates.oneWeekAgo)
          .concat(linkRequests.filter(linkRequest => linkRequest.status === 'accepted' && linkRequest.linkedAt > dates.oneWeekAgo)).length,
        pastMonth: linkRequests.filter(linkRequest => linkRequest.status === 'requested' && linkRequest.updatedAt > dates.thirtyDaysAgo)
          .concat(linkRequests.filter(linkRequest => linkRequest.status === 'accepted' && linkRequest.linkedAt > dates.thirtyDaysAgo)).length,
        pastYear: linkRequests.filter(linkRequest => linkRequest.status === 'requested' && linkRequest.updatedAt > dates.oneYearAgo)
          .concat(linkRequests.filter(linkRequest => linkRequest.status === 'accepted' && linkRequest.linkedAt > dates.oneYearAgo)).length
      }

      const filteredContacts = {
        pastWeek: savedContacts.filter(contact => contact.createdAt > dates.oneWeekAgo).length,
        pastMonth: savedContacts.filter(contact => contact.createdAt > dates.thirtyDaysAgo).length,
        pastYear: savedContacts.filter(contact => contact.createdAt > dates.oneYearAgo).length
      }

      const filteredOpsRequests = {
        pastWeek: filteredLinks.pastWeek + filteredLinkRequests.pastWeek + filteredContacts.pastWeek,
        pastMonth: filteredLinks.pastMonth + filteredLinkRequests.pastMonth + filteredContacts.pastMonth,
        pastYear: filteredLinks.pastYear + filteredLinkRequests.pastYear + filteredContacts.pastYear
      }

      const totalOps = linkedCards.length + linkRequests.length + savedContacts.length

      // Find Percent Increases
      const percentIncreases = {
        linkPercentIncrease: {
          pastWeek: {
            count: filteredLinks.pastWeek,
            percentIncrease: linkedCards.length > 0 ? +(filteredLinks.pastWeek / linkedCards.length).toFixed(2) : 0
          },
          pastMonth: {
            count: filteredLinks.pastMonth,
            percentIncrease: linkedCards.length > 0 ? +(filteredLinks.pastMonth / linkedCards.length).toFixed(2) : 0
          },
          pastYear: {
            count: filteredLinks.pastYear,
            percentIncrease: linkedCards.length > 0 ? +(filteredLinks.pastYear / linkedCards.length).toFixed(2) : 0
          }
        },
        linkRequestPercentIncrease: {
          pastWeek: {
            count: filteredLinkRequests.pastWeek,
            percentIncrease: linkRequests.length > 0 ? +(filteredLinkRequests.pastWeek / linkRequests.length).toFixed(2) : 0
          },
          pastMonth: {
            count: filteredLinkRequests.pastMonth,
            percentIncrease: linkRequests.length > 0 ? +(filteredLinkRequests.pastMonth / linkRequests.length).toFixed(2) : 0
          },
          pastYear: {
            count: filteredLinkRequests.pastYear,
            percentIncrease: linkRequests.length > 0 ? +(filteredLinkRequests.pastYear / linkRequests.length).toFixed(2) : 0
          }
        },
        contactPercentIncrease: {
          pastWeek: {
            count: filteredContacts.pastWeek,
            percentIncrease: savedContacts.length > 0 ? +(filteredContacts.pastWeek / savedContacts.length).toFixed(2) : 0
          },
          pastMonth: {
            count: filteredContacts.pastMonth,
            percentIncrease: savedContacts.length > 0 ? +(filteredContacts.pastMonth / savedContacts.length).toFixed(2) : 0
          },
          pastYear: {
            count: filteredContacts.pastYear,
            percentIncrease: savedContacts.length > 0 ? +(filteredContacts.pastYear / savedContacts.length).toFixed(2) : 0
          }
        },
        opsRequestPercentIncrease: {
          pastWeek: {
            count: filteredOpsRequests.pastWeek,
            percentIncrease: totalOps > 0 ? +(filteredOpsRequests.pastWeek / totalOps).toFixed(2) : 0
          },
          pastMonth: {
            count: filteredOpsRequests.pastMonth,
            percentIncrease: totalOps > 0 ? +(filteredOpsRequests.pastMonth / totalOps).toFixed(2) : 0
          },
          pastYear: {
            count: filteredOpsRequests.pastYear,
            percentIncrease: totalOps > 0 ? +(filteredOpsRequests.pastYear / totalOps).toFixed(2) : 0
          }
        }
      }

      const data = { links: linkedCards, cards: user.cards, savedContacts, percentIncreases }

      // Return
      return res.status(200).json({
        user: data,
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

  userContactDetails = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      const { userId, linkId } = req.query as any

      const link = await db.link.findUnique({
        where: {
          id: linkId
        },
        select: {
          id: true,
          metAt: true,
          event: true,
          linkedAt: true,
          notes: {
            select: {
              id: true,
              note: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      })
      // Verify user exists
      const userAuth = await db.userAuth.findUnique({
        where: {
          id: userId
        }
      })
      const user = await db.userBio.findUnique({
        where: {
          id: userId
        },
        select: {
          _count: {
            select: {
              cards: true
            }
          },
          groups: true,
          firstName: true,
          middleInitial: true,
          lastName: true,
          city: true,
          country: true,
          company: true,
          profileAvatar: true,
          state: true,
          cards: {
            where: {
              publicCard: true,
              activeCard: true
            },
            select: {
              cardId: true,
              cardName: true,
              fullName: true,
              headerPhoto: true,
              coverPhoto: true,
              brandedCoverPhoto: true,
              Contacts: {
                where: {
                  status: 'saved'
                },
                select: {
                  fullName: true,
                  contactId: true,
                  contactImage: true,
                  city: true,
                  state: true,
                  company: true,
                  jobTitle: true,
                  event: true,
                  metAt: true
                }
              }
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

      // const linkedCards = []
      const linkedProfiles: any = []
      const savedContacts = []
      const mutualLinks: any = []
      if (user.cards) {
        for (const card of user.cards) {
          const links = await db.link.findMany({
            where: {
              status: 'accepted',
              OR: [
                {
                  cardOne: card.cardId
                },
                {
                  cardTwo: card.cardId
                }
              ]
            },
            select: {
              id: true,
              CardOneRef: {
                select: {
                  cardId: true,
                  coverPhoto: true,
                  cardName: true,
                  fullName: true,
                  headerPhoto: true,
                  brandedCoverPhoto: true,
                  Contacts: {
                    select: {
                      contactImage: true,
                      status: true,
                      fullName: true,
                      company: true,
                      jobTitle: true
                    }
                  }
                }
              },
              CardTwoRef: {
                select: {
                  cardId: true,
                  coverPhoto: true,
                  cardName: true,
                  fullName: true,
                  headerPhoto: true,
                  brandedCoverPhoto: true,
                  Contacts: {
                    select: {
                      contactImage: true,
                      status: true,
                      fullName: true,
                      company: true,
                      jobTitle: true
                    }
                  }
                }
              }
            }
          })
          if (card.Contacts) {
            savedContacts.push(...card.Contacts)
          }

          if (links) {
            // collect linked cards with my card
            for (const link of links) {
              let otherCard = link.CardOneRef
              let myCardId = link.CardTwoRef.cardId
              if (link.CardOneRef.cardId === card.cardId) {
                otherCard = link.CardTwoRef
                myCardId = link.CardOneRef.cardId
              }
              // Getting and push other card profile details
              const userInfo = await this.#getLinkedUserInfo(otherCard.cardId)
              if (userInfo) {
                linkedProfiles.push({ ...userInfo, cardId: otherCard.cardId, linkId: link.id })
              }

              // Getting Mutual link profiles
              const mutuals = await this.#getMutualLinksUsers(otherCard.cardId, myCardId)
              if (mutuals?.length > 0) {
                mutualLinks.push(...mutuals)
              }
              // linkedCards.push({ ...link.CardTwoRef, linkId: link.id })
            }
          }
        }
      }

      // if (linkedCards?.length > 0) {
      //   for (const link of linkedCards) {
      //     const response: any | null = await db.userBio.findFirst({
      //       where: {
      //         profileType: 'user',
      //         cards: {
      //           some: { cardId: link.cardId }
      //         }
      //       },
      //       select: {
      //         id: true,
      //         firstName: true,
      //         middleInitial: true,
      //         lastName: true,
      //         profileAvatar: true,
      //         profTitle: true,
      //         company: true,
      //         city: true,
      //         state: true
      //       }
      //     })
      //     if (response) {
      //       linkedProfiles.push({ ...response, cardId: link.cardId, linkId: link.linkId })
      //     }
      //   }
      // }

      const data = {
        ...user,
        createdAt: userAuth?.createdAt,
        link,
        mutualLinks,
        links: linkedProfiles,
        cards: user.cards,
        savedContacts
      }
      // Return
      return res.status(200).json({
        user: data,
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

  #getLinkedUserInfo = async (cardId: string): Promise<any> => {
    try {
      const response: any | null = await db.userBio.findFirst({
        where: {
          profileType: 'user',
          cards: {
            some: { cardId }
          }
        },
        select: {
          id: true,
          firstName: true,
          middleInitial: true,
          lastName: true,
          profileAvatar: true,
          profTitle: true,
          company: true,
          city: true,
          state: true
        }
      })
      return response
    } catch (err) {
      return undefined
    }
  }

  #getMutualLinksUsers = async (cardId: string, myCardId: string): Promise<any> => {
    try {
      const mutualProfiles: any = []
      const links = await db.link.findMany({
        where: {
          status: 'accepted',
          OR: [
            {
              cardOne: cardId
            },
            {
              cardTwo: cardId
            }
          ],
          AND: [
            {
              cardOne: {
                not: myCardId
              }
            },
            {
              cardTwo: {
                not: myCardId
              }
            }
          ]
        },
        select: {
          id: true,
          CardOneRef: {
            select: {
              cardId: true,
              coverPhoto: true,
              cardName: true,
              fullName: true,
              headerPhoto: true,
              brandedCoverPhoto: true,
              Contacts: {
                select: {
                  contactImage: true,
                  status: true,
                  fullName: true,
                  company: true,
                  jobTitle: true
                }
              }
            }
          },
          CardTwoRef: {
            select: {
              cardId: true,
              coverPhoto: true,
              cardName: true,
              fullName: true,
              headerPhoto: true,
              brandedCoverPhoto: true,
              Contacts: {
                select: {
                  contactImage: true,
                  status: true,
                  fullName: true,
                  company: true,
                  jobTitle: true
                }
              }
            }
          }
        }
      })

      if (links) {
        // collect linked cards with my card
        for (const link of links) {
          let otherCardId = link.CardOneRef.cardId
          if (link.CardOneRef.cardId === cardId) {
            otherCardId = link.CardTwoRef.cardId
          }
          const userInfo = await this.#getLinkedUserInfo(otherCardId)
          if (userInfo) {
            mutualProfiles.push({ ...userInfo, cardId: otherCardId, linkId: link.id })
          }
        }
      }
      return mutualProfiles
    } catch (err) {
      return []
    }
  }
}

export default new UserController()

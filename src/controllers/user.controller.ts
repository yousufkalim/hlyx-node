import { Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { userControllerParams, userBioUpdateParams } from '../config/params'
import { validateUserUpdate, validateProfileImage, validateAllProfileImage } from '../utils/validations/user.controller.validation'
import { arrayLimits } from '../config/arrayLimits'
import BaseController from './base.controller'
import { db } from '../utils/db'

class UserController extends BaseController {
  // Return logged in User's Bio
  me = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.user?.id } })
      if (user === null) {
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update user
  updateBio = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userBioUpdateParams)
    try {
      // Validate input
      const validationError = validateUserUpdate(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify user exists
      const user = await db.userAuth.findUnique({ where: { id: req.params.id } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Update UserBio and return
      await db.userBio.update({
        where: { id: req.params.id },
        data: params
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Set active profile avatar
  updateProfileAvatar = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    const { profileImage } = params
    try {
      // Validate Input
      const validationError = validateProfileImage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify user / photo exists
      const image = await db.userPhoto.findUnique({
        where: {
          userId_pathToFile: {
            userId: req.params.id,
            pathToFile: profileImage
          }
        }
      })
      if (image === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.IMAGE_NOT_FOUND
        })
      }

      // Update and return
      await db.userBio.update({
        where: { id: req.params.id },
        data: {
          profileAvatar: profileImage
        }
      })

      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Add a card to user
  addCard = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.params.id } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Verify under maximum amount of Cards
      const cards = await db.card.findMany({ where: { userId: req.params.id } })
      if (cards.length >= arrayLimits.MAX_CARDS) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_CARD_LIMIT
        })
      }

      // Create Card data
      const cardData: any = {
        fullName: `${user.firstName} ${user.middleInitial ?? ''} ${user.lastName}`.replace(/ +(?= )/g, ''),
        company: user.company ?? undefined,
        profTitle: user.profTitle ?? undefined,
        industry: user.industry ?? undefined,
        country: user.country ?? undefined,
        city: user.city ?? undefined,
        state: user.state ?? undefined,
        zipcode: user.zipcode ?? undefined,
        emails: {
          create: {
            email: user.email
          }
        }
      }

      // Add optional fields if set
      if (user.phone !== null) {
        cardData.phones = {
          create: {
            phone: user.phone,
            type: 'main'
          }
        }
      }
      if (user.website !== null) {
        cardData.websites = {
          create: {
            url: user.website
          }
        }
      }

      // Update UserBio, create Card, and return
      await db.userBio.update({
        where: { id: req.params.id },
        data: {
          cards: {
            create: cardData
          }
        }
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Adds new photo to set of availble ones
  addProfilePhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    const { profileImage } = params
    try {
      // Validate Input
      const validationError = validateProfileImage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.params.id } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Verify under maximum amount Profile Images
      const photos = await db.userPhoto.findMany({ where: { userId: req.params.id } })
      if (photos.length >= arrayLimits.MAX_PROFILE_IMAGES) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_PHOTO_LIMIT
        })
      }

      // Check for uniqueness
      const image = await db.userPhoto.findUnique({
        where: {
          userId_pathToFile: {
            userId: req.params.id,
            pathToFile: profileImage
          }
        }
      })
      if (image != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.DUPLICATE_IMAGE
        })
      }

      // Update and return
      await db.userBio.update({
        where: { id: req.params.id },
        data: {
          profilePhotos: {
            create: {
              pathToFile: profileImage
            }
          }
        }
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Removes specified profile image
  deleteProfilePhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    const { profileImage } = params
    try {
      // Validate Input
      const validationError = validateProfileImage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify user / photo exists
      const image = await db.userPhoto.findUnique({
        where: {
          userId_pathToFile: {
            userId: req.params.id,
            pathToFile: profileImage
          }
        }
      })
      if (image === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.IMAGE_NOT_FOUND
        })
      }

      // Delete and return
      await db.userPhoto.delete({
        where: {
          userId_pathToFile: {
            userId: req.params.id,
            pathToFile: profileImage
          }
        }
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Deletes Existing Photos and Adds new ones
  deleteExistingAddNewProfilePhotos = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    const { allPhotos } = params
    try {
      // Validate Input
      const validationError = validateAllProfileImage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Images are unique
      if (allPhotos[0]?.pathToFile === allPhotos[1]?.pathToFile ||
          allPhotos[0]?.pathToFile === allPhotos[2]?.pathToFile ||
          allPhotos[1]?.pathToFile === allPhotos[2]?.pathToFile) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.ARRAY_DUPLICATE_IMAGE
        })
      }

      // Delete existing images
      await db.userPhoto.deleteMany({ where: { userId: req.params.id } })

      // Add all listed images
      await db.userBio.update({
        where: {
          id: req.params.id
        },
        data: {
          profilePhotos: {
            create: allPhotos
          }
        }
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Find all photos associated with user
  findProfilePhotos = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.params.id } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Grab images and return
      const images = await db.userPhoto.findMany({
        where: {
          userId: req.params.id
        },
        select: {
          pathToFile: true
        }
      })
      return res.status(200).json({
        images,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Find all links associated with user
  userAllLinks = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.params.id } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.id
        },
        include: {
          Links: true
        }
      })

      // Set array and return
      const returnArray: string[] = []
      for (const card of cards) {
        for (const link of card.Links) {
          if (link.cardOne === card.cardId) {
            returnArray.push(link.cardTwo)
          } else {
            returnArray.push(link.cardOne)
          }
        }
      }
      return res.status(200).json({
        returnArray,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new UserController()

import { Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { userControllerParams } from '../config/params'
import { validateUserUpdate, validateProfileImage } from '../utils/validations/user.controller.validation'
import { cardTypes } from '../config/enumTypes'
import { arrayLimits } from '../config/arrayLimits'
import BaseController from './base.controller'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class UserController extends BaseController {
  // Return logged in User's Bio
  me = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await prisma.userBio.findUnique({
        where: {
          id: req.user?.id
        }
      })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

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

  // Update user via id passed as param
  updateBio = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    const { firstName, middleInitial, lastName, phone, profession, profTitle, industry, profRole, website } = params
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
      const user = await prisma.userAuth.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      const userBioObject: any = {
        firstName,
        middleInitial,
        lastName,
        profession,
        profTitle,
        industry,
        profRole,
        website
      }

      // Only update phone in this route if null
      if (user.phone === null) {
        // Verify uniqueness of phone
        const phoneUnique = await prisma.userAuth.findUnique({ where: phone })
        if (phoneUnique !== null) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: `${messages.USER_ALREADY_EXIST} with phone number: "${phone}"`
          })
        }
        // Update UserAuth table
        await prisma.userAuth.update({
          where: { id: parseInt(req.params.id) },
          data: { phone }
        })
        userBioObject.phone = phone
      }

      // Update UserBio table and return
      await prisma.userBio.update({
        where: { id: parseInt(req.params.id) },
        data: userBioObject
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

  // Update profile image
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

      // Verify user exists
      const user = await prisma.userBio.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Update and return
      await prisma.userBio.update({
        where: { id: parseInt(req.params.id) },
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

  addCard = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, userControllerParams)
    const { cardType } = params
    try {
      // Validate Card Type
      if (!cardTypes.includes(cardType)) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CARDTYPE
        })
      }

      // Verify user exists
      const user = await prisma.userBio.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Verify under maximum amount of Cards
      const cards = await prisma.card.findMany({ where: { userId: parseInt(req.params.id) } })
      if (cards.length >= arrayLimits.MAX_CARDS) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_CARD_LIMIT
        })
      }

      // Create Card data
      const cardData: any = {
        cardType,
        fullName: `${user.firstName} ${user.middleInitial ?? ''} ${user.lastName}`.replace(/ +(?= )/g, ''),
        company: user.company ?? undefined,
        profTitle: user.profTitle ?? undefined,
        industry: user.industry ?? undefined,
        profRole: user.profRole ?? undefined,
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

      // Add option fields if set
      if (user.phone !== null) {
        cardData.phone = {
          create: {
            phone: user.phone,
            type: 'main'
          }
        }
      }
      if (user.website !== null) {
        cardData.website = {
          create: {
            website: user.website
          }
        }
      }

      // Update UserBio, create Card, and return
      await prisma.userBio.update({
        where: { id: parseInt(req.params.id) },
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
      const user = await prisma.userBio.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Verify under maximum amount Profile Images
      const photos = await prisma.userPhoto.findMany({ where: { userId: parseInt(req.params.id) } })
      if (photos.length >= arrayLimits.MAX_PROFILE_IMAGES) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_PHOTO_LIMIT
        })
      }

      // Update and return
      await prisma.userBio.update({
        where: { id: parseInt(req.params.id) },
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
}

export default new UserController()

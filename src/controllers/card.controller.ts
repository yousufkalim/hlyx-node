import { Request, Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { arrayLimits } from '../config/arrayLimits'
import { cardControllerParams } from '../config/params'
import { validateCardUpdate, validateCovePhoto } from '../utils/validations/card.controller.validation'
import BaseController from './base.controller'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class CardController extends BaseController {
  // Find a Card
  find = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Find Card and return
      const card = await prisma.card.findUnique({ 
        where: {
          urlPath: req.params.urlPath
        },
        select: {
          urlPath: true,
          cardType: true,
          userAvatar: true,
          coverPhoto: true,
          fullName: true,
          emails: {
            select: {
              email: true,
              type: true
            }
          },
          phones: {
            select: {
              phone: true,
              extention: true,
              type: true
            }
          },
          calendar: true,
          websites: {
            select: {
              website: true,
              description: true
            }
          },
          country: true,
          city: true,
          state: true,
          streetAddress: true,
          zipcode: true,
          socialMedias: {
            select: {
              platform: true,
              handle: true
            }
          },
          additionalLinks: {
            select: {
              website: true,
              icon: true,
              title: true,
              description: true
            }
          },
          about: true,
          company: true,
          profTitle: true,
          occupation: true,
          industry: true,
          educationLevel: true,
          schoolName: true,
          academicFocus: true,
          degreeType: true,
          accolades: true,
          achievements: {
            select: {
              title: true,
              issuedBy: true,
              issuedYear: true
            }
          },
          businessGoals: true,
          needsAsks: true,
          hobbies: true,
          interests: true,
          skills: true,
          motto: true,
          services: {
            select: {
              title: true,
              icon: true,
              details: true
            }
          }
        }
      })

      // Check if null and return
      if (card === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }
      return res.status(200).json({
        card,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update a Card
  update = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const {
      fullName, emails, phones, calendar, websites, coverPhoto,
      country, city, state, streetAddress, zipcode, socialMedias, additionalLinks,
      about, company, profTitle, occupation, industry, educationLevel, schoolName,
      academicFocus, degreeType, accolades, achievements, businessGoals, needsAsks,
      hobbies, interests, skills, motto, services
    } = params
    try {
      // Validate input
      const validationError = validateCardUpdate(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify card exists
      const originalCard = await prisma.card.findUnique({ where: { urlPath: req.params.urlPath } })
      if (originalCard === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      const data: any = {
        fullName,
        calendar,
        coverPhoto,
        country,
        city,
        state,
        streetAddress,
        zipcode,
        about,
        company,
        profTitle,
        occupation,
        industry,
        educationLevel,
        schoolName,
        academicFocus,
        degreeType,
        accolades,
        businessGoals,
        needsAsks,
        hobbies,
        interests,
        skills,
        motto,
        emails: {
          create: emails
        },
        phones: {
          create: phones
        },
        websites: {
          create: websites
        },
        socialMedias: {
          create: socialMedias
        },
        additionalLinks: {
          create: additionalLinks
        },
        achievements: {
          create: achievements
        },
        services: {
          create: services
        }
      }

      // Remove existing emails, phones, websites, etc.....
      await prisma.cardEmails.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardPhones.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardWebsites.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardSocialMedias.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAdditionalLinks.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAchievements.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardServices.deleteMany({ where: { cardId: req.params.urlPath } })

      // Update and return
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data
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

  addCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { coverPhoto } = params
    try {
      // Validate Input
      const validationError = validateCovePhoto(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Card exists
      const card = await prisma.card.findUnique({ where: { urlPath: req.params.urlPath } })
      if (card === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Verify under maximum amount Profile Images
      const photos = await prisma.cardPhotos.findMany({ where: { cardId: req.params.urlPath } })
      if (photos.length >= arrayLimits.MAX_COVER_PHOTOS) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_PHOTO_LIMIT
        })
      }

      // Verify Uniqueness
      let uniqueTest: boolean = true
      photos.forEach(photo => {
        if (photo.pathToFile === coverPhoto){
          uniqueTest = false
          return
        }
      })
      if (!uniqueTest) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.DUPLICATE_IMAGE
        })
      }

      // Update and return
      await prisma.card.update({
        where: { urlPath: req.params.urlPath },
        data: {
          coverPhotos: {
            create: {
              pathToFile: coverPhoto
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

  // Removes specified cover photo
  deleteCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { coverPhoto } = params
    try {
      // Validate Input
      const validationError = validateCovePhoto(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify user / photo exists
      const image = await prisma.cardPhotos.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.urlPath,
            pathToFile: coverPhoto
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
      await prisma.cardPhotos.delete({
        where: {
          cardId_pathToFile: {
            cardId: req.params.urlPath,
            pathToFile: coverPhoto
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

  // Find all cover photos associated with card
  findCoverPhotos = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify card exists
      const card = await prisma.card.findUnique({ where: { urlPath: req.params.urlPath } })
      if (card === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Grab images and return
      const images = await prisma.cardPhotos.findMany({
        where: {
          cardId: req.params.urlPath
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

  cardAllLinks = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify card exists
      const card = await prisma.card.findUnique({
        where: {
          urlPath: req.params.urlPath
        },
        include: {
          Links: true
        }
      })
      if (card === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Set array and return
      const returnArray: string[] = []
      for (let i = 0; i < card?.Links.length; i++) {
        if (card.Links[i].cardOne === card.urlPath) {
          returnArray.push(card.Links[i].cardTwo)
        } else {
          returnArray.push(card.Links[i].cardOne)
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

  delete = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify card exists
      const card = await prisma.card.findUnique({
        where: {
          urlPath: req.params.urlPath
        }
      })
      if (card === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Delete and return
      await prisma.cardPortfolio.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardServices.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAchievements.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAdditionalLinks.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardSocialMedias.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardWebsites.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardPhones.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardEmails.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardPhotos.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.link.deleteMany({ where: { cardOne: req.params.urlPath } })
      await prisma.link.deleteMany({ where: { cardTwo: req.params.urlPath } })
      await prisma.card.delete({ where: { urlPath: req.params.urlPath } })

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

export default new CardController()

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
        include: {
          coverPhotos: {
            select: {
              pathToFile: true
            }
          },
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
          websites: {
            select: {
              website: true,
              description: true
            }
          },
          socialMedias: {
            select: {
              platform: true,
              handle: true
            }
          },
          additionalLinks: {
            select: {
              website: true,
              title: true,
              icon: true,
              description: true
            }
          },
          education: {
            select: {
              academicLevel: true,
              schoolName: true,
              graduationYear: true,
              academicFocus: true,
              degreeType: true
            }
          },
          accolades: {
            select: {
              title: true,
              fromWho: true,
              startDate: true,
              endDate: true
            }
          },
          achievements: {
            select: {
              title: true,
              issuedBy: true,
              issuedYear: true
            }
          },
          businessGoals: {
            select: {
              status: true,
              title: true,
              subTitle: true,
              percentComplete: true,
              startDate: true,
              endDate: true,
              about: true
            }
          },
          businessNeeds: {
            select: {
              date: true,
              title: true,
              subTitle: true,
              status: true
            }
          },
          services: {
            select: {
              type: true,
              title: true,
              subtitle: true,
              icon: true,
              details: true
            }
          },
          portfolio: {
            select: {
              type: true,
              image: true,
              title: true,
              subTitle: true
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

  // Update everything about a Card (Probably better to do individual updates)
  update = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const {
      fullName, emails, phones, calendar, websites, coverPhoto,
      country, city, state, streetAddress, zipcode, socialMedias, additionalLinks,
      about, company, profTitle, occupation, industry, education, accolades,
      achievements, businessGoals, businessNeeds, hobbies, interests,
      skills, motto, services, portfolio
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
        education: {
          create: education
        },
        accolades: {
          create: accolades
        },
        businessGoals: {
          create: businessGoals
        },
        businessNeeds: {
          create: businessNeeds
        },
        achievements: {
          create: achievements
        },
        services: {
          create: services
        },
        portfolio: {
          create: portfolio
        }
      }

      // Remove existing emails, phones, websites, etc.....
      await prisma.cardEmails.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardPhones.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardWebsites.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardSocialMedias.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAdditionalLinks.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAccolades.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAchievements.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardBusinessGoals.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardBusinessNeeds.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardServices.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardPortfolio.deleteMany({ where: { cardId: req.params.urlPath } })

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

  setActiveCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { profileImage } = params
    try {
      // Validate Input
      const validationError = validateCovePhoto(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify card / photo exists
      const image = await prisma.cardPhotos.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.urlPath,
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
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          coverPhoto: profileImage
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

      // Verify under maximum amount Profile Images
      const photos = await prisma.cardPhotos.findMany({ where: { cardId: req.params.urlPath } })
      if (photos.length >= arrayLimits.MAX_COVER_PHOTOS) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_PHOTO_LIMIT
        })
      }

      // Verify Uniqueness
      let uniqueTest = true
      for (const photo of photos) {
        if (photo.pathToFile === coverPhoto) {
          uniqueTest = false
          break
        }
      }
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

      // Verify photo exists
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
      // Delete and return
      await prisma.cardPortfolio.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardServices.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardBusinessNeeds.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardBusinessGoals.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAchievements.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardAccolades.deleteMany({ where: { cardId: req.params.urlPath } })
      await prisma.cardEducations.deleteMany({ where: { cardId: req.params.urlPath } })
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

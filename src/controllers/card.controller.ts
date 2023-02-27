import { Request, Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { arrayLimits } from '../config/arrayLimits'
import { cardControllerParams } from '../config/params'
import { validateCardFullName, validateCardContactPage, validateCardAboutPage, validateCardServices, validateCardPortfolio, validateCardCoverPhoto, validateAllCoverImage } from '../utils/validations/card.controller.validation'
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
              subTitle: true,
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

  // Update Full Name on Card
  updateFullName = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { fullName } = params
    try {
      const validationError = validateCardFullName(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }
      // Update and return
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          fullName
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

  // Update Contact Page on Card
  updateContactPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const routeSpecificParams = ['emails', 'phones', 'calendar', 'websites', 'country',
      'city', 'state', 'streetAddress', 'zipcode', 'socialMedias', 'additionalLinks']
    const params = this.filterParams(req.body, routeSpecificParams)
    try {
      const validationError = validateCardContactPage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Check one-to-many relations
      if (params.emails != null) {
        params.emails = {
          create: params.emails
        }
        await prisma.cardEmails.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.phones != null) {
        params.phones = {
          create: params.phones
        }
        await prisma.cardPhones.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.websites != null) {
        params.websites = {
          create: params.websites
        }
        await prisma.cardWebsites.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.socialMedias != null) {
        params.socialMedias = {
          create: params.socialMedias
        }
        await prisma.cardSocialMedias.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.additionalLinks != null) {
        params.additionalLinks = {
          create: params.additionalLinks
        }
        await prisma.cardAdditionalLinks.deleteMany({ where: { cardId: req.params.urlPath } })
      }

      // Update and return
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          ...params
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

  // Update About Page on Card
  updateAboutPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const routeSpecificParams = ['about', 'company', 'profTitle', 'occupation',
      'industry', 'education', 'accolades', 'achievements', 'businessGoals',
      'businessNeeds', 'hobbies', 'interests', 'skills', 'motto']
    const params = this.filterParams(req.body, routeSpecificParams)
    try {
      const validationError = validateCardAboutPage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Check one-to-many relations
      if (params.education != null) {
        params.education = {
          create: params.education
        }
        await prisma.cardEducations.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.accolades != null) {
        for (const accolade of params.accolades) {
          if (accolade.startDate != null) {
            accolade.startDate = new Date(accolade.startDate)
          }
          if (accolade.endDate != null) {
            accolade.endDate = new Date(accolade.endDate)
          }
        }
        params.accolades = {
          create: params.accolades
        }
        await prisma.cardAccolades.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.achievements != null) {
        params.achievements = {
          create: params.achievements
        }
        await prisma.cardAchievements.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.businessGoals != null) {
        for (const goal of params.businessGoals) {
          if (goal.startDate != null) {
            goal.startDate = new Date(goal.startDate)
          }
          if (goal.endDate != null) {
            goal.endDate = new Date(goal.endDate)
          }
        }
        params.businessGoals = {
          create: params.businessGoals
        }
        await prisma.cardBusinessGoals.deleteMany({ where: { cardId: req.params.urlPath } })
      }
      if (params.businessNeeds != null) {
        for (const need of params.businessNeeds) {
          if (need.date != null) {
            need.date = new Date(need.date)
          }
        }
        params.businessNeeds = {
          create: params.businessNeeds
        }
        await prisma.cardBusinessNeeds.deleteMany({ where: { cardId: req.params.urlPath } })
      }

      // Update and return
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          ...params
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

  // Update Services Page on Card
  updateServicesPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { services } = params
    try {
      const validationError = validateCardServices(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Delete Existing Services
      await prisma.cardServices.deleteMany({ where: { cardId: req.params.urlPath } })

      // Update and return
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          services: {
            create: services
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

  // Update Portfolio Page on Card
  updatePortfolioPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { portfolio } = params
    try {
      const validationError = validateCardPortfolio(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Delete existing
      await prisma.cardPortfolio.deleteMany({ where: { cardId: req.params.urlPath } })

      // Update and return
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          portfolio: {
            create: portfolio
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

  // Set active Cover Photo
  updateCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { coverPhoto } = params
    try {
      // Validate Input
      const validationError = validateCardCoverPhoto(params)
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

      // Update and return
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          coverPhoto
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

  // Adds new cover photo to set of availble ones
  addCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { coverPhoto } = params
    try {
      // Validate Input
      const validationError = validateCardCoverPhoto(params)
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
      const validationError = validateCardCoverPhoto(params)
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

  // Delete all existing cover photos and add new ones
  deleteExistingAddNewCoverPhotos = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { allPhotos } = params
    try {
      // Validate Input
      const validationError = validateAllCoverImage(params)
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
      await prisma.cardPhotos.deleteMany({ where: { cardId: req.params.urlPath } })

      // Add all listed images
      await prisma.card.update({
        where: {
          urlPath: req.params.urlPath
        },
        data: {
          coverPhotos: {
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

  // Find all links associated with card
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

  // Delete card
  delete = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Delete and return
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

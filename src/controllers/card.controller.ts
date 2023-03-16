import { Request, Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { arrayLimits } from '../config/arrayLimits'
import { cardAboutPageParams, cardContactPageParams, cardControllerParams } from '../config/params'
import { validateCardFullName, validateCardContactPage, validateCardAboutPage, validateCardServices, validateCardPortfolio, validateCardCoverPhoto, validateAllCoverImage } from '../utils/validations/card.controller.validation'
import BaseController from './base.controller'
import { db } from '../utils/db'

class CardController extends BaseController {
  // Find a Card
  find = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Find Card and return
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
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
              url: true,
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
              url: true,
              title: true,
              description: true
            }
          },
          education: {
            select: {
              academicLevel: true,
              schoolName: true,
              startYear: true,
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
              description: true,
              startYear: true,
              issuedBy: true,
              issuedYear: true
            }
          },
          businessGoals: {
            select: {
              status: true,
              title: true,
              percentComplete: true,
              startDate: true,
              endDate: true,
              description: true
            }
          },
          businessNeeds: {
            select: {
              date: true,
              title: true,
              description: true,
              status: true
            }
          },
          services: {
            select: {
              type: true,
              title: true,
              icon: true,
              details: true
            }
          },
          portfolio: {
            select: {
              type: true,
              image: true,
              title: true,
              media: true
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
      await db.card.update({
        where: {
          cardId: req.params.cardId
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
    const params = this.filterParams(req.body, cardContactPageParams)
    try {
      const validationError = validateCardContactPage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Check one-to-many relations
      // Emails
      if (params.emails != null) {
        params.emails = {
          create: params.emails
        }
        await db.cardEmails.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Phones
      if (params.phones != null) {
        params.phones = {
          create: params.phones
        }
        await db.cardPhones.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Websites
      if (params.websites != null) {
        params.websites = {
          create: params.websites
        }
        await db.cardWebsites.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Social Medias
      if (params.socialMedias != null) {
        params.socialMedias = {
          create: params.socialMedias
        }
        await db.cardSocialMedias.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Additional Links
      if (params.additionalLinks != null) {
        params.additionalLinks = {
          create: params.additionalLinks
        }
        await db.cardAdditionalLinks.deleteMany({ where: { cardId: req.params.cardId } })
      }

      // Update and return
      await db.card.update({
        where: {
          cardId: req.params.cardId
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
    const params = this.filterParams(req.body, cardAboutPageParams)
    try {
      const validationError = validateCardAboutPage(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Check one-to-many relations
      // Education
      if (params.education != null) {
        params.education = {
          create: params.education
        }
        await db.cardEducations.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Accolades
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
        await db.cardAccolades.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Achievements
      if (params.achievements != null) {
        params.achievements = {
          create: params.achievements
        }
        await db.cardAchievements.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Business Goals
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
        await db.cardBusinessGoals.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Business Needs
      if (params.businessNeeds != null) {
        for (const need of params.businessNeeds) {
          if (need.date != null) {
            need.date = new Date(need.date)
          }
        }
        params.businessNeeds = {
          create: params.businessNeeds
        }
        await db.cardBusinessNeeds.deleteMany({ where: { cardId: req.params.cardId } })
      }

      // Update and return
      await db.card.update({
        where: {
          cardId: req.params.cardId
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
      await db.cardServices.deleteMany({ where: { cardId: req.params.cardId } })

      // Update and return
      await db.card.update({
        where: {
          cardId: req.params.cardId
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
      await db.cardPortfolio.deleteMany({ where: { cardId: req.params.cardId } })

      // Update and return
      await db.card.update({
        where: {
          cardId: req.params.cardId
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
      const image = await db.cardPhotos.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
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
      await db.card.update({
        where: {
          cardId: req.params.cardId
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
      const photos = await db.cardPhotos.findMany({ where: { cardId: req.params.cardId } })
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
      await db.card.update({
        where: { cardId: req.params.cardId },
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
      const image = await db.cardPhotos.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
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
      await db.cardPhotos.delete({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
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
      await db.cardPhotos.deleteMany({ where: { cardId: req.params.cardId } })

      // Add all listed images
      await db.card.update({
        where: {
          cardId: req.params.cardId
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
      const card = await db.card.findUnique({ where: { cardId: req.params.cardId } })
      if (card === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Grab images and return
      const images = await db.cardPhotos.findMany({
        where: {
          cardId: req.params.cardId
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

  // Update visibility status
  updatePublicVisibility = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { publicCard } = req.body
    try {
      // Validate Input
      if (publicCard !== true && publicCard !== false) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.BOOLEAN_FAIL
        })
      }

      // Update and return
      await db.card.update({
        where: {
          cardId: req.params.cardId
        },
        data: {
          publicCard
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

  // Find all links associated with card
  cardAllLinks = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify card exists
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
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
        if (card.Links[i].cardOne === card.cardId) {
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
      await db.link.deleteMany({ where: { cardOne: req.params.cardId } })
      await db.link.deleteMany({ where: { cardTwo: req.params.cardId } })
      await db.card.delete({ where: { cardId: req.params.cardId } })

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

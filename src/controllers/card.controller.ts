import { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload'

import { ISharedCard, RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { cardAboutPageParams, cardContactPageParams, cardControllerParams } from '../config/params'
import {
  validateCardName,
  validateCardFullName,
  validateCardContactPage,
  validateCardAboutPage,
  validateCardServices,
  validateCardPortfolio,
  validateCardSlug
} from '../utils/validations/card.controller.validation'
import { templateIds } from '../config/enumTypes'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { awsUploadFile, awsDeleteFile } from '../utils/aws-image'

import BaseController from './base.controller'
import { db } from '../utils/db'
import notificationController from './notification.controller'
// import { arrayLimits } from '../config/arrayLimits'

class CardController extends BaseController {
  getBaseInfo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
          cardName: true,
          coverPhoto: true,
          slug: true,
          publicCard: true,
          activeCard: true,
          templateId: true,
          userAvatar: true,
          fullName: true,
          profTitle: true,
          company: true,
          city: true,
          state: true
        }
      })

      // Check if null and return
      if (!card) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  getContact = async (req: Request, res: Response): Promise<Response> => {
    try {
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
          _count: {
            select: {
              emails: true,
              phones: true,
              websites: true,
              socialMedias: true,
              additionalLinks: true
            }
          },
          coverPhoto: true,
          companyIcon: true,
          company: true,
          fullName: true,
          profTitle: true,
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
          calendars: {
            select: {
              label: true,
              title: true,
              url: true
            }
          },
          websites: {
            select: {
              url: true,
              description: true
            }
          },
          officeAddresses: {
            select: {
              city: true,
              state: true,
              label: true,
              zipcode: true,
              streetAddress: true
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
              handle: true,
              profileUrl: true,
              label: true
            }
          },
          additionalLinks: {
            select: {
              url: true,
              title: true,
              typeContent: true,
              description: true
            }
          }
        }
      })

      // Check if null and return
      if (!card) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  getAbout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
          _count: {
            select: {
              education: true,
              accolades: true,
              achievements: true,
              businessGoals: true,
              businessNeeds: true
            }
          },
          fullName: true,
          userAvatar: true,
          city: true,
          state: true,
          about: true,
          company: true,
          profTitle: true,
          occupation: true,
          industry: true,
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
          hobbies: true,
          interests: true,
          skills: true,
          motto: true
        }
      })

      // Check if null and return
      if (!card) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  getServices = async (req: Request, res: Response): Promise<Response> => {
    try {
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
          _count: {
            select: {
              services: true
            }
          },
          services: {
            select: {
              type: true,
              title: true,
              subtitle: true,
              details: true,
              positioning: true
            },
            orderBy: {
              positioning: 'asc'
            }
          }
        }
      })

      // Check if null and return
      if (!card) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  getPortfolio = async (req: Request, res: Response): Promise<Response> => {
    try {
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
          _count: {
            select: {
              portfolio: true
            }
          },
          portfolioTemplate: true,
          portfolio: {
            select: {
              image: true,
              title: true,
              details: true,
              positioning: true
            },
            orderBy: {
              positioning: 'asc'
            }
          }
        }
      })

      // Check if null and return
      if (!card) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Adds new cover photo to set of availble ones
  addCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      if (!req.files) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.FILE_REQUIRED
        })
      }

      const file = req.files.coverPhoto as UploadedFile
      if (!file) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.INVALID_FILE_LABEL} coverPhoto`
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
        req.params.cardId,
        'cover-photo',
        file.name,
        file.mimetype
      )

      const data: any = {
        coverPhotos: {
          create: {
            pathToFile
          }
        }
      }

      // Check if make makeActive is true
      if (req.body.makeActive === 'true') {
        data.coverPhoto = pathToFile
      }

      // Update and return
      await db.card.update({
        where: { cardId: req.params.cardId },
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

  // Delete Cover Photo
  deleteCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { pathToFile } = req.body
    try {
      if (!pathToFile) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'pathToFile required'
        })
      }

      // Verify card / photo exists
      const image = await db.cardCoverPhotos.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
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
        await db.cardCoverPhotos.delete({
          where: {
            cardId_pathToFile: {
              cardId: req.params.cardId,
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

  // Update active Cover Photo
  updateCoverPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { coverPhoto } = params
    try {
      if (!coverPhoto) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'coverPhoto is required'
        })
      }
      // Verify card / photo exists
      const image = await db.cardCoverPhotos.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
            pathToFile: coverPhoto
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Find all Cover Photos
  findCoverPhotos = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Grab images and return
      const images = await db.card.findMany({
        where: {
          cardId: req.params.cardId
        },
        select: {
          _count: {
            select: {
              coverPhotos: true
            }
          },
          coverPhotos: {
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

  // Add Company Icon
  addCompanyIcon = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      if (!req.files) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.FILE_REQUIRED
        })
      }

      const file = req.files.companyIcon as UploadedFile
      if (!file) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.INVALID_FILE_LABEL} companyIcon`
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
        req.params.cardId,
        'company-icon',
        file.name,
        file.mimetype
      )

      const data: any = {
        companyIcons: {
          create: {
            pathToFile
          }
        }
      }

      // Check if make makeActive is true
      if (req.body.makeActive === 'true') {
        data.companyIcon = pathToFile
      }

      // Update and return
      await db.card.update({
        where: { cardId: req.params.cardId },
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

  // Delete Cover Photo
  deleteCompanyIcon = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { pathToFile } = req.body
    try {
      if (!pathToFile) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'pathToFile required'
        })
      }

      // Verify card / photo exists
      const image = await db.cardCompanyIcons.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
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
        await db.cardCompanyIcons.delete({
          where: {
            cardId_pathToFile: {
              cardId: req.params.cardId,
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

  // Update Company Icon
  updateCompanyIcon = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { companyIcon } = params
    try {
      if (!companyIcon) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'companyIcon is required'
        })
      }
      // Verify card / photo exists
      const image = await db.cardCompanyIcons.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
            pathToFile: companyIcon
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
      await db.card.update({
        where: {
          cardId: req.params.cardId
        },
        data: {
          companyIcon
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

  // Find all Company Icons
  findCompanyIcons = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Grab images and return
      const images = await db.card.findMany({
        where: {
          cardId: req.params.cardId
        },
        select: {
          _count: {
            select: {
              companyIcons: true
            }
          },
          companyIcons: {
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

  // Update Card Name
  updateCardName = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { cardName } = params
    try {
      const validationError = validateCardName(params)
      if (validationError) {
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
          cardName
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

  // Update Full Name on Card
  updateFullName = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { fullName } = params
    try {
      const validationError = validateCardFullName(params)
      if (validationError) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Contact Page on Card
  updateContactPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardContactPageParams)
    try {
      const validationError = validateCardContactPage(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Header Photo Exists
      if (params.headerPhoto) {
        const photo = await db.cardCoverPhotos.findUnique({
          where: {
            cardId_pathToFile: {
              cardId: req.params.cardId,
              pathToFile: params.headerPhoto
            }
          }
        })
        if (!photo) {
          return res.status(404).json({
            code: codes.NOT_FOUND,
            message: messages.IMAGE_NOT_FOUND
          })
        }
      }

      // Check one-to-many relations
      // Emails
      if (params.emails) {
        params.emails = {
          create: params.emails
        }
        await db.cardEmails.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Phones
      if (params.phones) {
        params.phones = {
          create: params.phones
        }
        await db.cardPhones.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Websites
      if (params.websites) {
        params.websites = {
          create: params.websites
        }
        await db.cardWebsites.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Social Medias
      if (params.socialMedias) {
        params.socialMedias = {
          create: params.socialMedias
        }
        await db.cardSocialMedias.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Additional Links
      if (params.additionalLinks) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update About Page on Card
  updateAboutPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardAboutPageParams)
    try {
      const validationError = validateCardAboutPage(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Check one-to-many relations
      // Education
      if (params.education) {
        params.education = {
          create: params.education
        }
        await db.cardEducations.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Accolades
      if (params.accolades) {
        for (const accolade of params.accolades) {
          if (accolade.startDate) {
            accolade.startDate = new Date(accolade.startDate)
          }
          if (accolade.endDate) {
            accolade.endDate = new Date(accolade.endDate)
          }
        }
        params.accolades = {
          create: params.accolades
        }
        await db.cardAccolades.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Achievements
      if (params.achievements) {
        params.achievements = {
          create: params.achievements
        }
        await db.cardAchievements.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Business Goals
      if (params.businessGoals) {
        for (const goal of params.businessGoals) {
          if (goal.startDate) {
            goal.startDate = new Date(goal.startDate)
          }
          if (goal.endDate) {
            goal.endDate = new Date(goal.endDate)
          }
        }
        params.businessGoals = {
          create: params.businessGoals
        }
        await db.cardBusinessGoals.deleteMany({ where: { cardId: req.params.cardId } })
      }
      // Business Needs
      if (params.businessNeeds) {
        for (const need of params.businessNeeds) {
          if (need.date) {
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Services Page on Card
  updateServicesPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { services } = params
    try {
      if (!services) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'services is required'
        })
      }
      const validationError = validateCardServices(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Uniqueness / Accuracy of Positioning
      /*  1. Filter
          2. Sort ascending
          3. First conditional, checks for uniqueness
          4. Second conditional checks that the last element is the same as the legnth
      */
      const featuredServices: any = services.filter((service: any) => service.type === 'featured')
      const featuredPositionings = featuredServices.map((a: any) => a.positioning)
      featuredPositionings.sort((a: any, b: any) => {
        return a - b
      })
      if (
        featuredPositionings.length !== new Set(featuredPositionings).size ||
        featuredPositionings.length - 1 !== featuredPositionings[featuredPositionings.length - 1]
      ) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.POSITIONING_ERROR_SERVICE
        })
      }

      const mainServices: any = services.filter((service: any) => service.type === 'main')
      const mainPositionings = mainServices.map((a: any) => a.positioning)
      mainPositionings.sort((a: any, b: any) => {
        return a - b
      })
      if (
        mainPositionings.length !== new Set(mainPositionings).size ||
        mainPositionings.length - 1 !== mainPositionings[mainPositionings.length - 1]
      ) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.POSITIONING_ERROR_SERVICE
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Add Portfolio Image
  addPortfolioImage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      if (!req.files) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.FILE_REQUIRED
        })
      }

      const file = req.files.portfolioImage as UploadedFile
      if (!file) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.INVALID_FILE_LABEL} portfolioImage`
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
        req.params.cardId,
        'portfolio-image',
        file.name,
        file.mimetype
      )

      // Update and return
      await db.card.update({
        where: { cardId: req.params.cardId },
        data: {
          portfolioImages: {
            create: {
              pathToFile
            }
          }
        }
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

  // Update Portfolio Page on Card
  updatePortfolioPage = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const { portfolio } = params
    try {
      const validationError = validateCardPortfolio(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify all Images are in our database
      portfolio.forEach(async (element: any) => {
        const image = await db.cardPortfolioImages.findUnique({
          where: {
            cardId_pathToFile: {
              cardId: req.params.cardId,
              pathToFile: element.image
            }
          }
        })
        if (!image) {
          return res.status(404).json({
            code: codes.NOT_FOUND,
            message: messages.IMAGE_NOT_FOUND
          })
        }
      })

      // Verify Uniqueness / Accuracy of Positioning
      portfolio.sort((a: any, b: any) => {
        return a.positioning - b.positioning
      })
      const positionings = portfolio.map((a: any) => a.positioning)
      if (
        positionings.length !== new Set(positionings).size ||
        positionings.length - 1 !== positionings[positionings.length - 1]
      ) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.POSITIONING_ERROR_SERVICE
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Delete Portfolio Photo
  deletePortfolioPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { pathToFile } = req.body
    try {
      if (!pathToFile) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'pathToFile required'
        })
      }

      // Verify card / photo exists
      const image = await db.cardPortfolioImages.findUnique({
        where: {
          cardId_pathToFile: {
            cardId: req.params.cardId,
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
        await db.cardPortfolioImages.delete({
          where: {
            cardId_pathToFile: {
              cardId: req.params.cardId,
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Card Active status
  updateCardActivation = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { activeCard } = req.body
    try {
      // Validate Input
      if (activeCard !== true && activeCard !== false) {
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
          activeCard
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

  // Update Slug
  updateSlug = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, ['slug'])
    try {
      const validationError = validateCardSlug(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Uniqueness
      const unique = await db.card.findUnique({
        where: {
          slug: params.slug
        }
      })
      if (unique) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.CARD_SLUG_ERROR
        })
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Template
  updateTemplateId = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { templateId } = req.body
    try {
      // Validate Input
      if (!templateIds.includes(templateId)) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.TEMPLATE_ID_FAIL
        })
      }

      // Update and return
      await db.card.update({
        where: {
          cardId: req.params.cardId
        },
        data: {
          templateId
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

  // Update a card to user
  updateCard = async (req: RequestUserAuth, res: Response): Promise<Response> => {
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
        country,
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
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
          cardId: true,
          User: {
            select: {
              id: true,
              cards: true,
              isOnBoardingComplete: true
            }
          }
        }
      })
      if (!card) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
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
        country,
        state,
        zipcode,
        emails,
        phones,
        websites,
        officeAddresses,
        socialMedias,
        additionalLinks,
        calendars
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
      if (params.emails) {
        cardContactData.emails = {
          create: params.emails
        }
        await db.cardEmails.deleteMany({ where: { cardId: req.params.cardId } })
      }
      if (params.phones) {
        cardContactData.phones = {
          create: params.phones
        }
        await db.cardPhones.deleteMany({ where: { cardId: req.params.cardId } })
      }
      if (params.calendars) {
        cardContactData.calendars = {
          create: params.calendars
        }
        await db.cardCalendars.deleteMany({ where: { cardId: req.params.cardId } })
      }
      if (params.websites) {
        cardContactData.websites = {
          create: params.websites
        }
        await db.cardWebsites.deleteMany({ where: { cardId: req.params.cardId } })
      }
      if (params.officeAddresses) {
        cardContactData.officeAddresses = {
          create: params.officeAddresses
        }
        await db.cardOfficeAddresses.deleteMany({ where: { cardId: req.params.cardId } })
      }
      if (params.socialMedias) {
        cardContactData.socialMedias = {
          create: params.socialMedias
        }
        await db.cardSocialMedias.deleteMany({ where: { cardId: req.params.cardId } })
      }
      if (params.additionalLinks) {
        cardContactData.additionalLinks = {
          create: params.additionalLinks
        }
        await db.cardAdditionalLinks.deleteMany({ where: { cardId: req.params.cardId } })
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
      const updatedCard = await db.card.update({
        where: { cardId: req.params.cardId },
        data,
        select: {
          cardId: true
        }
      })

      return res.status(200).json({
        cardId: updatedCard.cardId,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  sharedProfileCard = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Shared card functionality with notifications
      const linksWithShared: string[] = req.body.sharedWith

      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
          cardId: true
        }
      })

      if (!card) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      if (!linksWithShared || linksWithShared?.length === 0) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.SHARED_CARD_USER_EMPTY
        })
      }

      const arr: ISharedCard[] = []
      for (const linkCard of linksWithShared) {
        const card = await db.card.findUnique({
          where: {
            cardId: linkCard
          }
        })
        if (!card) {
          return res.status(404).json({
            code: codes.NOT_FOUND,
            message: messages.SHARED_CARD_NOT_USER
          })
        }
        const obj = {
          directsTo: 'sharedContact',
          idDirectedTo: linkCard,
          message: req.body.message
        }
        arr.push(obj)
      }

      await notificationController.createNotificationOfSharedCard(card.cardId, arr)

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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new CardController()

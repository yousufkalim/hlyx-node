import { Request, Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { cardControllerParams } from '../config/params'
import { validateCardUpdate } from '../utils/validations/card.controller.validation'
import BaseController from './base.controller'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class CardController extends BaseController {
  // Find a Card
  find = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Find Card and return
      const card = await prisma.card.findUnique({ where: { urlPath: req.params.urlPath } })
      return res.status(200).json({
        card,
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

  // Update a Card
  update = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, cardControllerParams)
    const {
      fullName, professionalName, coverPhoto, emails, phones, calendar, websites,
      country, city, state, streetAddress, zipcode, socialMedias, additionalLinks,
      about, company, profTitle, occupation, industry, educationLevel, schoolName,
      academicFocus, degreeType, accolades, achievements, businessGoals, needsAsks,
      hobbies, interests, skills, motto
    } = params
    try {
      // Validate input
      const validationError = validateCardUpdate(params)
      if (validationError != null) {
        return res.status(400).json({ code: codes.BAD_REQUEST, message: validationError })
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
        professionalName,
        coverPhoto,
        calendar,
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
        }
      }

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
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }
}

export default new CardController()

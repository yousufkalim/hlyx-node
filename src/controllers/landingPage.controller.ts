import { Request, Response } from 'express'
import fs from 'fs/promises'
import path from 'path'

import BaseController from './base.controller'
import { contactUsParams } from '../config/params'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { validateContactUs } from '../utils/validations/landingPage.controller.validation'
import { contactUsEmailer } from '../utils/emailers'
import { createActiveCampaignContact } from '../utils/activeCampaign'

class LandingPageController extends BaseController {
  // Contact Us
  contactUs = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, contactUsParams)
    const { name, email, phone, subject, message } = params
    try {
      // Validate input
      const validationError = validateContactUs(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Email and return
      await contactUsEmailer(name, email, phone, subject, message)

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

  test = async (req: Request, res: Response): Promise<Response | undefined> => {
    const { email, firstName, lastName, listIdentifer, status } = req.body
    try {
      await createActiveCampaignContact(email, firstName, lastName, listIdentifer, status)

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

  apkFileProvider = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      const fileName = req.params.fileName
      if (!fileName) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.FILE_NAME_REQUIRED
        })
      }

      const file = await fs.readFile(path.join(__dirname, '../assets/apkFiles/', fileName))
      return res.send(file)
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  apkFileList = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      const fileNames = await fs.readdir(path.join(__dirname, '../assets/apkFiles/'))

      return res.status(200).json({
        fileNames,
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
  // Pricing (least prio atm)
}

export default new LandingPageController()

import { Request, Response } from 'express'

import BaseController from './base.controller'
import { contactUsParams } from '../config/params'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { validateContactUs } from '../utils/validations/landingPage.controller.validation'
import { contactUsEmailer } from '../utils/emailers'

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

  // Pricing (least prio atm)
}

export default new LandingPageController()

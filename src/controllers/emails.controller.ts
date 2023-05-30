// This file is strictly to test the emailers and to provide
// example usage of each function

import { Request, Response } from 'express'

import BaseController from './base.controller'
import { codes } from '../config/codes'
import { messages } from '../config/messages'

import {
  verifyCodeEmailer,
  passwordResetEmailer,
  linkRequestEmail,
  contactRequestEmailer,
  acceptContactEmailer
} from '../utils/emailers'

class EmailController extends BaseController {
  verifyEmail = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      await verifyCodeEmailer('jordanroessle@gmail.com', 'Jordan', 'Roessle')
      return res.status(200).json({
        codes: codes.OK
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  passwordReset = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      await passwordResetEmailer('jordanroessle@gmail.com', 'Jordan')
      return res.status(200).json({
        codes: codes.OK
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  linkRequest = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      await linkRequestEmail('jordanroessle@gmail.com', 'Jordan', 'James')
      return res.status(200).json({
        codes: codes.OK
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  contactRequestEmail = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      await contactRequestEmailer('jordanroessle@gmail.com', 'Jordan', 'James Beckley', 'James', 'Jordans Card')
      return res.status(200).json({
        codes: codes.OK
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  acceptContactEmail = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      await acceptContactEmailer('jordanroessle@gmail.com', 'Kelly', 'Jordan Roessle', 'https://hlyx.me', 'https://brand.hlyx.io/assets/logo/emailLogo.png')
      return res.status(200).json({
        codes: codes.OK
      })
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new EmailController()

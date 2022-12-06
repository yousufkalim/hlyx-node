import { Request, Response } from 'express'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import BaseController from './base.controller'

class AuthController extends BaseController {
  login = (req: Request, res: Response): Response => {
    try {
      return res.status(200).json({ code: codes.OK, message: messages.SUCCESS })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  register = (req: Request, res: Response): Response => {
    try {
      return res.status(200).json({ code: codes.OK, message: messages.SUCCESS })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new AuthController()

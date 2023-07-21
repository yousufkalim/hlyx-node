import { Response } from 'express'

import { codes } from '../config/codes'
import { RequestUserAuth } from '../config/interfaces/common.interface'
import { messages } from '../config/messages'
import { db } from '../utils/db'
import BaseController from './base.controller'

class FavouriteSocialMedia extends BaseController {
  create = async (req: RequestUserAuth, res: Response): Promise<any> => {
    try {
      const { body } = req
      const { name } = body
      if (!name) {
        return res.status(400).json({ code: codes.BAD_REQUEST, message: 'Name is required' })
      }

      const isExist = await db.favouriteSocialMedias.findFirst({
        where: {
          name,
          userId: req.params.userId
        }
      })
      if (isExist) {
        return res
          .status(400)
          .json({ code: codes.BAD_REQUEST, message: 'Social media already exist in favourite' })
      }
      const data = {
        favouriteSocialMedias: {
          create: {
            name
          }
        }
      }
      await db.userBio.update({
        where: {
          id: req.params.userId
        },
        data
      })

      return res.status(201).json({ code: codes.OK, message: messages.SUCCESS })
    } catch (err: any) {
      console.log('Error ', err)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  getSocialMedias = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      const response = await db.favouriteSocialMedias.findMany({
        where: {
          userId: req.params.userId
        }
      })

      return res.status(201).json({ code: codes.OK, data: response })
    } catch (err) {
      console.log('Error ', err)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new FavouriteSocialMedia()

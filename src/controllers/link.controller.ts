import { Response } from 'express'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { linkControllerParams } from '../config/params'
import BaseController from './base.controller'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class LinkController extends BaseController {
  // Create a link
  create = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo, status } = params
    try {
      // Verify status
      if (status !== 'requested' && status !== 'blocked') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_LINK_STATUS
        })
      }

      // Verify Cards exist
      const foundCardOne = await prisma.card.findUnique({ where: { urlPath: cardOne } })
      const foundCardTwo = await prisma.card.findUnique({ where: { urlPath: cardTwo } })
      if (foundCardOne === null || foundCardTwo === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // // Verify Link does not already exist
      // const uniqueOne = await prisma.link.findUnique({
      //   where: { cardOne, cardTwo}
      // })
      // const uniqueTwo = await prisma.link.find
      // if (uniqueness != null) {
      //   return res.status(400).json({ code: codes.BAD_REQUEST, message: messages.LINK_ALREADY_EXISTS })
      // }

      // // Create Link
      // const link = await Link.create({
      //   linkedUsers,
      //   status,
      //   recentChangeDoneBy: '0'
      // })

      return res.status(200).json({ code: codes.OK, message: messages.SUCCESS })
    } catch (error: any) {
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new LinkController()

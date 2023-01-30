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

      // Verify Link does not already exist
      const uniqueness = await prisma.link.findUnique({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        }
      })
      if (uniqueness != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.LINK_ALREADY_EXISTS
        })
      }

      // Create Link and return
      await prisma.link.create({
        data: {
          cardOne,
          cardTwo,
          status: 'accepted',
          recentChangeBy: cardOne
        }
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

  delete = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo } = params
    try {
      // Verify Cards exist
      const foundCardOne = await prisma.card.findUnique({ where: { urlPath: cardOne } })
      const foundCardTwo = await prisma.card.findUnique({ where: { urlPath: cardTwo } })
      if (foundCardOne === null || foundCardTwo === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Delete Link and return
      await prisma.link.delete({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        }
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

  find = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo } = params
    try {
      // Find Link
      const link = await prisma.link.findUnique({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        }
      })

      // Check Link exists before returning
      if (link === null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.LINK_NOT_FOUND
        })
      }
      return res.status(200).json({
        link,
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

  // Update Link (Note: THIS ROUTE WILL NOT WORK FOR ADMIN, RELIES ON REQ.USER)
  update = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo, status } = params
    try {
      // Verify Cards exist
      const foundCardOne = await prisma.card.findUnique({ where: { urlPath: cardOne } })
      const foundCardTwo = await prisma.card.findUnique({ where: { urlPath: cardTwo } })
      if (foundCardOne === null || foundCardTwo === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Verify link exists
      const updateMe = await prisma.link.findUnique({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        }
      })
      if (updateMe === null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.LINK_NOT_FOUND
        })
      }

      // Discover which card is making the request
      let currentChange: any
      if (foundCardOne.userId === req.user?.id) {
        currentChange = cardOne
      } else if (foundCardTwo.userId === req.user?.id) {
        currentChange = cardTwo
      } else {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.ACCESS_DENIED
        })
      }

      // Verify status change makes sense
      switch (status) {
        case 'requested': {
          // Verify status is currently 'declined'
          if (updateMe.status !== 'declined') {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.INVALID_LINK_STATUS
            })
          }
          // Verify user that 'declined' is that one now requesting
          if (updateMe.recentChangeBy !== currentChange) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.ACCESS_DENIED
            })
          }
          break
        }
        case 'accepted':
        case 'declined': {
          // Verify status is currently 'requested'
          if (updateMe.status !== 'requested') {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.INVALID_LINK_STATUS
            })
          }
          // Verify user accepting / declining is not the one who 'requested'
          if (updateMe.recentChangeBy === currentChange) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.ACCESS_DENIED
            })
          }
          break
        }
        case 'blocked': {
          // No restrictions
          break
        }
        default:
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_LINK_STATUS
          })
      }

      // Update link status and return
      await prisma.link.update({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        },
        data: {
          status,
          recentChangeBy: currentChange
        }
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

export default new LinkController()

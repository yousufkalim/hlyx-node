import { Response } from 'express'

import { RequestUserAuth, RequestLink } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { linkControllerParams } from '../config/params'
import BaseController from './base.controller'
import { db } from '../utils/db'

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

      // Verify Link does not already exist
      const uniqueness = await db.link.findUnique({
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
      await db.link.create({
        data: {
          cardOne,
          cardTwo,
          status,
          recentChangeBy: cardOne
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

  // Delete a link
  delete = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo } = params
    try {
      // Verify Link exists
      const link = await db.link.findUnique({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        }
      })
      if (link === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.LINK_NOT_FOUND
        })
      }

      // Delete Link and return
      await db.link.delete({
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Find a Link
  find = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo } = params
    try {
      // Find Link
      const link = await db.link.findUnique({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        },
        select: {
          cardOne: true,
          cardTwo: true,
          status: true
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Link
  update = async (req: RequestLink, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo, status } = params
    try {
      // Verify Cards exist
      const foundCardOne = await db.card.findUnique({ where: { urlPath: cardOne } })
      const foundCardTwo = await db.card.findUnique({ where: { urlPath: cardTwo } })
      if (foundCardOne === null || foundCardTwo === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Verify link exists
      const updateMe = await db.link.findUnique({
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

      // Set current change
      if (req.card === 'one') {
        currentChange = cardOne
      } else if (req.card === 'two') {
        currentChange = cardTwo
      } else {
        // Should never be reached
        return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      await db.link.update({
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }
}

export default new LinkController()

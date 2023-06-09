import { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload'

import {
  RequestLink,
  RequestUserAuth,
  RequestNotification,
  ISearch,
  IGeneralLinks
} from '../config/interfaces/common.interface'
import {
  IArrayLink,
  IArrayLinkWithBaseInfo,
  ILinkWithBaseInfo
} from '../config/interfaces/link.validation.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { linkControllerParams } from '../config/params'
import {
  validateLinkSearchType,
  validateNote
} from '../utils/validations/link.controller.validation'
import { arrayLimits } from '../config/arrayLimits'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { awsUploadFile, awsDeleteFile } from '../utils/aws-image'

import BaseController from './base.controller'
import notificationController from './notification.controller'
import { db } from '../utils/db'
import { stringLengths } from '../config/stringLengths'
import { linkRequestEmail } from '../utils/emailers'

class LinkController extends BaseController {
  // Create a link
  create = async (req: RequestLink, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo, status, message, metAt, event } = params
    try {
      // Validate Input
      if (message) {
        if (message.length > stringLengths.MESSAGE_MAX) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            messages: `Message should be a string shorter than ${stringLengths.MESSAGE_MAX} characters`
          })
        }
      }

      const foundCardOne = await db.card.findUnique({ where: { cardId: req.body.cardOne } })
      const foundCardTwo = await db.card.findUnique({ where: { cardId: req.body.cardTwo } })
      if (!foundCardOne || !foundCardTwo) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }
      // Verify same user does not own both cards
      if (foundCardOne.userId === foundCardTwo.userId) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          messages: messages.LINK_SAME_USER
        })
      }

      // Verify logged in user owns one of the cards
      if (foundCardOne.userId !== req.user?.id && foundCardTwo.userId !== req.user?.id) {
        return res.status(403).json({
          code: codes.FORBIDDEN,
          message: messages.ACCESS_DENIED
        })
      }

      // Discover which card is making the request and set req.card
      if (foundCardOne.userId === req.user?.id) {
        req.card = {
          requester: req.body.cardOne,
          recipient: req.body.cardTwo
        }
      } else {
        req.card = {
          requester: req.body.cardTwo,
          recipient: req.body.cardOne
        }
      }

      // Verify status
      if (status !== 'requested' && status !== 'blocked') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_LINK_STATUS
        })
      }

      // Verify Link does not already exist (if link does exist try updating)
      const uniqueness1 = await db.link.findUnique({
        where: {
          cardOne_cardTwo: {
            cardOne,
            cardTwo
          }
        }
      })
      if (uniqueness1) {
        req.link = uniqueness1
        return await this.update(req, res)
      }
      const uniqueness2 = await db.link.findUnique({
        where: {
          cardOne_cardTwo: {
            cardOne: cardTwo,
            cardTwo: cardOne
          }
        }
      })
      if (uniqueness2) {
        req.link = uniqueness2
        return await this.update(req, res)
      }

      /*
        *
        *
        *
        Validation for metAt and event required
        *
        *
        *
      */

      // Create Link
      const card = await db.card.update({
        where: {
          cardId: req.card.requester
        },
        data: {
          Links: {
            create: {
              cardTwo: req.card.recipient,
              status,
              recentChangeBy: cardOne,
              metAt,
              event
            }
          }
        },
        select: {
          Links: {
            select: {
              id: true,
              cardOne: true,
              cardTwo: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      })

      const linkId = card.Links[0].id

      const returnData: any = {
        linkId,
        code: codes.OK,
        message: messages.SUCCESS
      }

      // // Create Notification if requested
      if (status === 'requested') {
        const reqNotification: RequestNotification = req as Request
        reqNotification.notification = {
          cardId: req.card.recipient,
          directsTo: 'linkRequest',
          message,
          idDirectedTo: linkId
        }

        const notification = await notificationController.createNotification(reqNotification)
        if (!notification.success) {
          throw Error(messages.NOTIFICATION_CREATE_CALLED_INCORRECTLY)
        }
        returnData.notificationId = notification.notificationId

        // Send email if user allows
        let userId: string
        let emailerName: string
        let linkRequesterName: string
        if (foundCardOne.cardId === req.card.recipient) {
          userId = foundCardOne.userId
          emailerName = foundCardTwo.fullName
          linkRequesterName = foundCardOne.fullName
        } else {
          userId = foundCardTwo.userId
          emailerName = foundCardOne.fullName
          linkRequesterName = foundCardTwo.fullName
        }
        const emailPerference = await db.userNotification.findUnique({
          where: {
            userId
          },
          select: {
            newLinkRequest: true,
            User: {
              select: {
                email: true
              }
            }
          }
        })
        if (emailPerference?.newLinkRequest) {
          await linkRequestEmail(emailPerference.User.email, emailerName, linkRequesterName)
        }
      }

      // Return
      return res.status(200).json(returnData)
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Link
  update = async (req: RequestLink, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    let { status } = params
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      const updateMe = req.link

      // Verify status change makes sense
      switch (status) {
        case 'requested': {
          // Verify status is currently 'declined'
          if (updateMe.status === 'blocked' || updateMe.status === 'accepted') {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.INVALID_LINK_STATUS
            })
          }
          // Declined Case: verify user that 'declined' is that one now requesting
          if (updateMe.status === 'declined' && updateMe.recentChangeBy !== req.card.requester) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.LINK_WRONG_USER
            })
          }
          // Requested Case: if both users requested, make accepted
          if (updateMe.status === 'requested' && updateMe.recentChangeBy === req.card.requester) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.LINK_ALREADY_REQUESTED
            })
          }
          if (updateMe.status === 'requested') {
            status = 'accepted'
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
          if (updateMe.recentChangeBy === req.card.requester) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.LINK_WRONG_USER
            })
          }
          break
        }
        case 'blocked': {
          // Check if already blocked to trigger bothBlock boolean
          if (updateMe.status === 'blocked' && req.card.requester !== updateMe.recentChangeBy) {
            const link = await db.link.update({
              where: {
                id: req.link.id
              },
              data: {
                bothUserBlock: true
              },
              select: {
                id: true,
                cardOne: true,
                cardTwo: true,
                updatedAt: true
              }
            })
            return res.status(200).json({
              link,
              code: codes.OK,
              message: messages.SUCCESS
            })
          }
          break
        }
        case 'muted': {
          if (req.link.status !== 'accepted' && req.link.status !== 'muted') {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.MUTE_INVALID
            })
          }
          if (req.link.status === 'muted' && req.card.requester !== updateMe.recentChangeBy) {
            const link = await db.link.update({
              where: {
                id: req.link.id
              },
              data: {
                bothUserMute: true
              },
              select: {
                id: true,
                cardOne: true,
                cardTwo: true,
                updatedAt: true
              }
            })
            return res.status(200).json({
              link,
              code: codes.OK,
              message: messages.SUCCESS
            })
          }
          break
        }
        default:
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_LINK_STATUS
          })
      }

      // Update link status and return
      const link = await db.link.update({
        where: {
          id: req.link.id
        },
        data: {
          status,
          recentChangeBy: req.card.requester
        },
        select: {
          id: true,
          cardOne: true,
          cardTwo: true,
          updatedAt: true
        }
      })

      return res.status(200).json({
        link,
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

  // Update metAt / event
  updateDetails = async (req: RequestLink, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { metAt, event } = params
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      /*
        *
        *
        *
        Validation for metAt and event required
        *
        *
        *
      */

      // Update and return
      await db.link.update({
        where: {
          id: req.link.id
        },
        data: {
          metAt,
          event
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

  // Unblock
  unblockLink = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Verify Status
      if (req.link.status !== 'blocked') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.LINK_NOT_BLOCKED
        })
      }

      // If both users have blocked then undo flag
      if (req.link.bothUserBlock) {
        await db.link.update({
          where: {
            id: req.link.id
          },
          data: {
            bothUserBlock: false,
            recentChangeBy: req.card.recipient // Sets it to as if the other user just blocked
          }
        })
      } else if (req.card.requester === req.link.recentChangeBy) {
        // If only one user has blocked, delete link
        await db.link.delete({ where: { id: req.link.id } })
      } else {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.LINK_NOT_BLOCKED
        })
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

  // Unmute Link
  unmuteLink = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Verify Status
      if (req.link.status !== 'muted') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.LINK_NOTE_MUTED
        })
      }

      // If both users have muted then undo flag
      if (req.link.bothUserMute) {
        await db.link.update({
          where: {
            id: req.link.id
          },
          data: {
            bothUserMute: false,
            recentChangeBy: req.card.recipient // Sets it to as if the other user just blocked
          }
        })
      } else if (req.card.requester === req.link.recentChangeBy) {
        // If only one user has mute return to accepted
        await db.link.update({
          where: {
            id: req.link.id
          },
          data: {
            status: 'accepted'
          }
        })
      } else {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.LINK_NOTE_MUTED
        })
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

  // Find all links associated with card
  cardAllLinks = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      const query = this.#getSearchQuery(req.query)
      const { search, searchBy: searchType } = query

      let card

      // Get links when search apply
      if (search && searchType) {
        // Search by location links
        if (searchType === 'location') {
          card = await db.card.findUnique({
            where: {
              cardId: req.params.cardId
            },
            select: {
              _count: {
                select: {
                  Links: true
                }
              },
              cardId: true,
              Links: {
                where: {
                  status: 'accepted',
                  OR: [
                    {
                      CardOneRef: {
                        OR: [
                          {
                            city: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          },
                          {
                            state: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          }
                        ]
                      }
                    },
                    {
                      CardTwoRef: {
                        OR: [
                          {
                            city: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          },
                          {
                            state: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          }
                        ]
                      }
                    }
                  ]
                },
                select: {
                  id: true,
                  cardOne: true,
                  cardTwo: true,
                  updatedAt: true
                }
              },
              LinksDuplicate: {
                where: {
                  status: 'accepted',
                  OR: [
                    {
                      CardOneRef: {
                        OR: [
                          {
                            city: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          },
                          {
                            state: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          }
                        ]
                      }
                    },
                    {
                      CardTwoRef: {
                        OR: [
                          {
                            city: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          },
                          {
                            state: {
                              contains: search,
                              mode: 'insensitive'
                            }
                          }
                        ]
                      }
                    }
                  ]
                },
                select: {
                  id: true,
                  cardOne: true,
                  cardTwo: true,
                  updatedAt: true
                }
              }
            }
          })
        } else {
          card = await db.card.findUnique({
            where: {
              cardId: req.params.cardId
            },
            select: {
              _count: {
                select: {
                  Links: true
                }
              },
              cardId: true,
              Links: {
                where: {
                  status: 'accepted',
                  OR: [
                    {
                      CardOneRef: {
                        [searchType]: {
                          contains: search,
                          mode: 'insensitive'
                        }
                      }
                    },
                    {
                      CardTwoRef: {
                        [searchType]: {
                          contains: search,
                          mode: 'insensitive'
                        }
                      }
                    }
                  ]
                },
                select: {
                  id: true,
                  cardOne: true,
                  cardTwo: true,
                  updatedAt: true
                }
              },
              LinksDuplicate: {
                where: {
                  status: 'accepted',
                  OR: [
                    {
                      CardOneRef: {
                        [searchType]: {
                          contains: search,
                          mode: 'insensitive'
                        }
                      }
                    },
                    {
                      CardTwoRef: {
                        [searchType]: {
                          contains: search,
                          mode: 'insensitive'
                        }
                      }
                    }
                  ]
                },
                select: {
                  id: true,
                  cardOne: true,
                  cardTwo: true,
                  updatedAt: true
                }
              }
            }
          })
        }
      } else {
        const response = await db.card.findUnique({
          where: {
            cardId: req.params.cardId
          },
          select: {
            _count: {
              select: {
                Links: true
              }
            },
            cardId: true,
            Links: {
              where: {
                status: 'accepted'
              },
              select: {
                id: true,
                cardOne: true,
                cardTwo: true,
                updatedAt: true
              }
            },
            LinksDuplicate: {
              where: {
                status: 'accepted'
              },
              select: {
                id: true,
                cardOne: true,
                cardTwo: true,
                updatedAt: true
              }
            }
          }
        })
        card = response
      }

      if (!card) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
      }

      // Combine Links and grab info
      card.Links.push(...card.LinksDuplicate)
      const cardLinks = await this.#getInfoPerCard(card)

      return res.status(200).json({
        _count: cardLinks?.length,
        cardLinks,
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

  // Find all connections associated with user ( include user links and links of user's links)
  userAllConnections = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true
        }
      })

      // Search query parameters
      const query = this.#getSearchQuery(req.query)
      const { search, searchBy: searchType } = query
      // Loop through all cards, find links and return
      const general: IArrayLink[] = []
      const connectedLinks: IArrayLink[] = []

      for (const card of cards) {
        // General
        let generalLinks: IGeneralLinks[] = []
        let allLinks: IGeneralLinks[] = []
        if (search && searchType) {
          generalLinks = await this.#getSearchedLinks(card.cardId, searchType, search)
          const response = await db.link.findMany({
            where: {
              OR: [
                {
                  cardOne: card.cardId,
                  status: 'accepted',
                  cardOneFavorite: false
                },
                {
                  cardTwo: card.cardId,
                  status: 'accepted',
                  cardTwoFavorite: false
                }
              ]
            },
            select: {
              id: true,
              cardOne: true,
              cardTwo: true,
              updatedAt: true
            }
          })
          allLinks = response
        } else {
          const response = await db.link.findMany({
            where: {
              OR: [
                {
                  cardOne: card.cardId,
                  status: 'accepted',
                  cardOneFavorite: false
                },
                {
                  cardTwo: card.cardId,
                  status: 'accepted',
                  cardTwoFavorite: false
                }
              ]
            },
            select: {
              id: true,
              cardOne: true,
              cardTwo: true,
              updatedAt: true
            }
          })

          generalLinks = response
          allLinks = response
        }

        general.push({
          cardId: card.cardId,
          Links: generalLinks
        })

        connectedLinks.push({
          cardId: card.cardId,
          Links: allLinks
        })
      }

      // Grab base info and return
      const generalLinks = await this.#getBaseInfoAllCards(general)
      const linksWithoutSearch = await this.#getBaseInfoAllCards(connectedLinks)

      // Find Mututal Connections
      const myCardIds = cards.map((item) => item.cardId)
      const otherCardIds = []
      if (linksWithoutSearch) {
        for (const otherLinkObj of linksWithoutSearch) {
          for (const otherLink of otherLinkObj.Links) {
            otherCardIds.push(otherLink.cardId)
          }
        }
      }
      let mutualCards: any = []
      if (otherCardIds.length > 0) {
        const otherCards = await this.#getBaseInfoAllCardsOthers(
          myCardIds,
          otherCardIds,
          searchType,
          search
        )
        mutualCards = otherCards
      }

      return res.status(200).json({
        mutualLinks: mutualCards,
        generalLinks,
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

  // Find all links associated with user
  userAllLinks = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true
        }
      })

      // Search query parameters
      const query = this.#getSearchQuery(req.query)
      const { search, searchBy: searchType } = query
      // Loop through all cards, find links and return
      const favorites: IArrayLink[] = []
      const general: IArrayLink[] = []

      for (const card of cards) {
        // Favorites
        const favoriteLinks = await db.link.findMany({
          where: {
            OR: [
              {
                cardOne: card.cardId,
                status: 'accepted',
                cardOneFavorite: true
              },
              {
                cardTwo: card.cardId,
                status: 'accepted',
                cardTwoFavorite: true
              }
            ]
          },
          select: {
            id: true,
            cardOne: true,
            cardTwo: true,
            updatedAt: true
          }
        })
        favorites.push({
          cardId: card.cardId,
          Links: favoriteLinks
        })

        // General
        let generalLinks: IGeneralLinks[] = []
        if (search && searchType) {
          generalLinks = await this.#getSearchedLinks(card.cardId, searchType, search)
        } else {
          const response = await db.link.findMany({
            where: {
              OR: [
                {
                  cardOne: card.cardId,
                  status: 'accepted',
                  cardOneFavorite: false
                },
                {
                  cardTwo: card.cardId,
                  status: 'accepted',
                  cardTwoFavorite: false
                }
              ]
            },
            select: {
              id: true,
              cardOne: true,
              cardTwo: true,
              updatedAt: true
            }
          })
          generalLinks = response
        }

        general.push({
          cardId: card.cardId,
          Links: generalLinks
        })
      }

      // Grab base info and return
      const favoriteLinks = await this.#getBaseInfoAllCards(favorites)
      const generalLinks = await this.#getBaseInfoAllCards(general)

      return res.status(200).json({
        favoriteLinks,
        generalLinks,
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

  // Find all blocked links associated with user
  userAllBlocks = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.params.userId } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true
        }
      })

      // Loop through all cards, find links and return
      const allLinks: IArrayLink[] = []
      for (const card of cards) {
        const Links = await db.link.findMany({
          where: {
            OR: [
              {
                cardOne: card.cardId,
                status: 'blocked'
              },
              {
                cardTwo: card.cardId,
                status: 'blocked'
              }
            ]
          },
          select: {
            id: true,
            cardOne: true,
            cardTwo: true,
            updatedAt: true
          }
        })
        allLinks.push({
          cardId: card.cardId,
          Links
        })
      }

      // Grab base info and return
      const allBlocks = await this.#getBaseInfoAllCards(allLinks)

      return res.status(200).json({
        allBlocks,
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

  // Find all incoming link requests
  userAllIncomingLinkRequests = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.params.userId } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true
        }
      })

      // Loop through all cards, find links and return
      const allLinks: IArrayLink[] = []
      for (const card of cards) {
        const Links = await db.link.findMany({
          where: {
            OR: [
              {
                cardOne: card.cardId,
                status: 'requested'
              },
              {
                cardTwo: card.cardId,
                status: 'requested'
              }
            ],
            NOT: {
              recentChangeBy: card.cardId
            }
          },
          select: {
            id: true,
            cardOne: true,
            cardTwo: true,
            updatedAt: true
          }
        })
        allLinks.push({
          cardId: card.cardId,
          Links
        })
      }

      // Grab base info and return
      const allIncoming = await this.#getBaseInfoAllCards(allLinks)

      return res.status(200).json({
        allIncoming,
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

  // Find all outgoing link requests
  userAllOutgoingLinkRequests = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userBio.findUnique({ where: { id: req.params.userId } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          cardId: true
        }
      })

      // Loop through all cards, find links and return
      const allLinks: IArrayLink[] = []
      for (const card of cards) {
        const Links = await db.link.findMany({
          where: {
            OR: [
              {
                cardOne: card.cardId,
                status: 'requested',
                recentChangeBy: card.cardId
              },
              {
                cardTwo: card.cardId,
                status: 'requested',
                recentChangeBy: card.cardId
              }
            ]
          },
          select: {
            id: true,
            cardOne: true,
            cardTwo: true,
            updatedAt: true
          }
        })
        allLinks.push({
          cardId: card.cardId,
          Links
        })
      }

      // Grab base info and return
      const allOutgoing = await this.#getBaseInfoAllCards(allLinks)

      return res.status(200).json({
        allOutgoing,
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

  // Delete Link
  deleteLink = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      switch (req.link.status) {
        case 'accepted':
          break
        case 'requested':
          // Try Declining Instead
          if (req.card.recipient === req.link.recentChangeBy) {
            req.body.status = 'declined'
            return await this.update(req, res)
          }
          break
        case 'declined':
          // Don't let user who was declined to delete the link (otherwise can resend link request)
          if (req.card.requester !== req.link.recentChangeBy) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.INVALID_LINK_STATUS
            })
          }
          break
        case 'blocked':
          return await this.unblockLink(req, res)
      }

      // Delete and return
      await db.link.delete({ where: { id: req.link.id } })
      return res.status(200).json({
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  /* Notes */
  // Create a Note
  createNote = async (req: RequestLink, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { note } = params
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Validate Input
      const validationError = validateNote(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Link Status is Accepted
      if (req.link.status !== 'accepted') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.NOTE_NOT_ACCEPTED
        })
      }

      // Verify number of notes is under maximum
      const existingNotes = await db.linkNotes.findMany({
        where: {
          linkId: req.link.id,
          authorId: req.card.requester
        }
      })
      if (existingNotes.length >= arrayLimits.MAX_NOTES) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_NOTE_LIMIT
        })
      }

      // Create note and return
      const newNote = await db.linkNotes.create({
        data: {
          linkId: req.link.id,
          authorId: req.card.requester,
          recipientId: req.card.recipient,
          note
        }
      })
      return res.status(200).json({
        newNote,
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

  findAllNotes = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Verify Link Status is Accepted
      if (req.link.status !== 'accepted') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.NOTE_NOT_ACCEPTED
        })
      }

      const notes = await db.link.findMany({
        where: {
          id: req.link.id
        },
        select: {
          _count: {
            select: {
              notes: {
                where: {
                  authorId: req.card.requester
                }
              }
            }
          },
          notes: {
            where: {
              authorId: req.card.requester
            },
            orderBy: {
              updatedAt: 'desc'
            }
          }
        }
      })
      return res.status(200).json({
        notes,
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

  updateNote = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { note } = params
    try {
      // Validate Input
      const validationError = validateNote(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Update and return
      const updatedNote = await db.linkNotes.update({
        where: {
          id: req.params.noteId
        },
        data: {
          note
        }
      })
      return res.status(200).json({
        updatedNote,
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

  deleteNote = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Delete and return (all necessary validations done in middleware)
      const deletedNote = await db.linkNotes.delete({
        where: {
          id: req.params.noteId
        }
      })
      return res.status(200).json({
        deletedNote,
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

  /* Link Photos */
  // Adds new Link Photo
  addLinkPhoto = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link?.photos) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Verify Under Maximum Amount of Link Images
      const imagesBelongToUser = req.link.photos.filter(
        (element) => element.cardId === req.card?.requester
      )
      if (imagesBelongToUser.length >= arrayLimits.MAX_LINK_IMAGES) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EXCEEDS_PHOTO_LIMIT
        })
      }

      if (!req.files) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.FILE_REQUIRED
        })
      }

      const file = req.files.linkPhoto as UploadedFile
      if (!file) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.INVALID_FILE_LABEL} linkPhoto`
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
        req.link.id,
        'link-photo',
        file.name,
        file.mimetype
      )

      // Update and return
      await db.link.update({
        where: { id: req.link.id },
        data: {
          photos: {
            create: {
              cardId: req.card.requester,
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

  // Find all photos associated with Link (Images viewable by both users)
  findLinkPhotos = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm eq.link is set
      if (!req.card?.requester || !req.card?.recipient || !req.link?.photos) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Grab images and return
      const images = await db.link.findMany({
        where: {
          id: req.link.id
        },
        select: {
          _count: {
            select: {
              photos: true
            }
          },
          photos: {
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

  // Delete Cover Photo
  deleteLinkPhoto = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const { pathToFile } = req.body
    try {
      if (!pathToFile) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: 'pathToFile required'
        })
      }

      // Verify card / photo exists
      const image = await db.linkPhoto.findUnique({
        where: {
          linkId_pathToFile: {
            linkId: req.params.linkId,
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
        await db.linkPhoto.delete({
          where: {
            linkId_pathToFile: {
              linkId: req.params.linkId,
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

  /* Link Favorites */
  addToFavorites = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Update and return
      if (req.card.requester === req.link.cardOne) {
        await db.link.update({
          where: {
            id: req.link.id
          },
          data: {
            cardOneFavorite: true
          }
        })
      } else {
        await db.link.update({
          where: {
            id: req.link.id
          },
          data: {
            cardTwoFavorite: true
          }
        })
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

  removeFavorites = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Update and return
      if (req.card.requester === req.link.cardOne) {
        await db.link.update({
          where: {
            id: req.link.id
          },
          data: {
            cardOneFavorite: false
          }
        })
      } else {
        await db.link.update({
          where: {
            id: req.link.id
          },
          data: {
            cardTwoFavorite: false
          }
        })
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

  /* Private Functions */
  #getBaseInfoAllCards = async (
    arrayLinks: IArrayLink[]
  ): Promise<IArrayLinkWithBaseInfo[] | undefined> => {
    try {
      const returnArray: IArrayLinkWithBaseInfo[] = []
      for (const userCard of arrayLinks) {
        const linkInfo = await this.#getInfoPerCard(userCard)
        if (!linkInfo) {
          throw Error(messages.LINK_CARD_ID_NOT_FOUND)
        }
        returnArray.push({
          myCardId: userCard.cardId,
          Links: linkInfo,
          _count: linkInfo.length
        })
      }
      return returnArray
    } catch (error: any) {
      console.error(error)
    }
  }

  #getInfoPerCard = async (userCard: IArrayLink): Promise<ILinkWithBaseInfo[] | undefined> => {
    try {
      const linkInfo: ILinkWithBaseInfo[] = []
      for (const link of userCard.Links) {
        let otherUserId = link.cardOne
        if (link.cardOne === userCard.cardId) {
          otherUserId = link.cardTwo
        }
        const otherCard = await db.card.findUnique({
          where: {
            cardId: otherUserId
          },
          select: {
            cardId: true,
            slug: true,
            publicCard: true,
            userAvatar: true,
            fullName: true,
            profTitle: true,
            company: true,
            city: true,
            state: true
          }
        })
        if (!otherCard) {
          throw Error(messages.LINK_CARD_ID_NOT_FOUND)
        }
        linkInfo.push(otherCard)
      }
      return linkInfo
    } catch (error: any) {
      console.error(error)
    }
  }

  #getSearchQuery = (query: ISearch): ISearch => {
    const { search, searchBy } = query
    let searchType = searchBy
    if (search && searchBy) {
      const searchTypeValidationError = validateLinkSearchType({ searchBy })
      if (searchTypeValidationError) {
        searchType = ''
      }
    }

    return { search, searchBy: searchType }
  }

  #getSearchedLinks = async (
    cardId: string,
    searchType: string,
    search: string
  ): Promise<IGeneralLinks[] | []> => {
    let generalLinks = []
    if (searchType === 'location') {
      const response = await db.link.findMany({
        where: {
          OR: [
            {
              cardOne: cardId,
              status: 'accepted',
              cardOneFavorite: false,
              CardTwoRef: {
                OR: [
                  {
                    city: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  },
                  {
                    state: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            },
            {
              cardTwo: cardId,
              status: 'accepted',
              cardTwoFavorite: false,
              CardOneRef: {
                OR: [
                  {
                    city: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  },
                  {
                    state: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            }
          ]
        },
        select: {
          id: true,
          cardOne: true,
          cardTwo: true,
          updatedAt: true
        }
      })
      generalLinks = response
    } else {
      const response = await db.link.findMany({
        where: {
          OR: [
            {
              cardOne: cardId,
              status: 'accepted',
              cardOneFavorite: false,
              CardTwoRef: {
                [searchType]: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            },
            {
              cardTwo: cardId,
              status: 'accepted',
              cardTwoFavorite: false,
              CardOneRef: {
                [searchType]: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          ]
        },
        select: {
          id: true,
          cardOne: true,
          cardTwo: true,
          updatedAt: true
        }
      })
      generalLinks = response
    }

    return generalLinks
  }

  /* Private Functions */
  #getBaseInfoAllCardsOthers = async (
    myCards: string[],
    otherCards: string[],
    searchType: string | undefined,
    search: string | undefined
  ): Promise<any[] | undefined> => {
    try {
      const allOtherLinks: any = []
      let allCards: any = []
      for (const otherCard of otherCards) {
        const response = await db.link.findMany({
          where: {
            cardOne: {
              notIn: myCards
            },
            cardTwo: {
              notIn: myCards
            },
            OR: [
              {
                cardOne: otherCard,
                status: 'accepted',
                cardOneFavorite: false
              },
              {
                cardTwo: otherCard,
                status: 'accepted',
                cardTwoFavorite: false
              }
            ]
          },
          select: {
            id: true,
            cardOne: true,
            cardTwo: true,
            updatedAt: true
          }
        })
        allOtherLinks.push(...response)
      }

      if (allOtherLinks.length > 0) {
        const filteredOtherCardIds = allOtherLinks.map((item: any) =>
          otherCards.includes(item.cardOne) ? item.cardTwo : item.cardOne
        )

        if (filteredOtherCardIds.length > 0) {
          const otherCards = await this.#getInfoOfOtherCard(
            filteredOtherCardIds,
            searchType,
            search
          )
          allCards = otherCards
        }
        // this.#getInfoOfOtherCard()
      }

      return allCards
    } catch (error: any) {
      // const returnArray: IArrayLinkWithBaseInfo[] = []
      // for (const userCard of arrayLinks) {
      //   const linkInfo = await this.#getInfoPerCard(userCard)
      //   if (!linkInfo) {
      //     throw Error(messages.LINK_CARD_ID_NOT_FOUND)
      //   }
      //   returnArray.push({
      //     myCardId: userCard.cardId,
      //     Links: linkInfo,
      //     _count: linkInfo.length
      //   })
      // }
      // return returnArray
      console.error(error)
    }
  }

  #getInfoOfOtherCard = async (
    otherCardIds: string[],
    searchType: string | undefined,
    search: string | undefined
  ): Promise<ILinkWithBaseInfo[] | undefined> => {
    try {
      const cards: ILinkWithBaseInfo[] = []
      for (const card of otherCardIds) {
        if (searchType && search) {
          if (searchType === 'location') {
            const otherCard = await db.card.findFirst({
              where: {
                cardId: card,
                OR: [
                  {
                    city: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  },
                  {
                    state: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  }
                ]
              },
              select: {
                cardId: true,
                slug: true,
                publicCard: true,
                userAvatar: true,
                fullName: true,
                profTitle: true,
                company: true,
                city: true,
                state: true
              }
            })
            // if (!otherCard) {
            //   throw Error(messages.LINK_CARD_ID_NOT_FOUND)
            // }
            if (otherCard) {
              cards.push(otherCard)
            }
          } else {
            const otherCard = await db.card.findFirst({
              where: {
                cardId: card,
                [searchType]: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              select: {
                cardId: true,
                slug: true,
                publicCard: true,
                userAvatar: true,
                fullName: true,
                profTitle: true,
                company: true,
                city: true,
                state: true
              }
            })
            // if (!otherCard) {
            //   throw Error(messages.LINK_CARD_ID_NOT_FOUND)
            // }
            if (otherCard) {
              cards.push(otherCard)
            }
          }
        } else {
          const otherCard = await db.card.findUnique({
            where: {
              cardId: card
            },
            select: {
              cardId: true,
              slug: true,
              publicCard: true,
              userAvatar: true,
              fullName: true,
              profTitle: true,
              company: true,
              city: true,
              state: true
            }
          })
          if (!otherCard) {
            throw Error(messages.LINK_CARD_ID_NOT_FOUND)
          }
          cards.push(otherCard)
        }
      }
      return cards
    } catch (error: any) {
      console.error(error)
    }
  }
}

export default new LinkController()

import { Response } from 'express'
import { UploadedFile } from 'express-fileupload'

import { RequestLink, RequestUserAuth } from '../config/interfaces/common.interface'
import { IArrayLink, IArrayLinkWithBaseInfo, ILinkWithBaseInfo, INotificationArray } from '../config/interfaces/link.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { linkControllerParams } from '../config/params'
import { validateNote, validateNotification } from '../utils/validations/link.controller.validation'
import { arrayLimits } from '../config/arrayLimits'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { awsUploadFile } from '../utils/aws-image'

import BaseController from './base.controller'
import { db } from '../utils/db'

class LinkController extends BaseController {
  // Create a link
  create = async (req: RequestLink, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { cardOne, cardTwo, status } = params
    try {
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

      // Create Link
      const link = await db.link.create({
        data: {
          cardOne: req.card.requester,
          cardTwo: req.card.recipient,
          status,
          recentChangeBy: cardOne
        },
        select: {
          id: true,
          cardOne: true,
          cardTwo: true,
          updatedAt: true
        }
      })

      // Return
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      if (req.link.bothUserBlock) {
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Find all links associated with card
  cardAllLinks = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      const card = await db.card.findUnique({
        where: {
          cardId: req.params.cardId
        },
        select: {
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
        cardLinks,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
        const generalLinks = await db.link.findMany({
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      const existingNotes = await db.linkNotes.findMany({ where: { authorId: req.card.requester } })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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

      // // Find notes and return
      const notes = await db.linkNotes.findMany({
        where: {
          linkId: req.link.id,
          authorId: req.card.requester
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
      return res.status(200).json({
        notes,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  /* Link Photos */
  // Adds new Link Photo (TEST WITH AWS)
  addLinkPhoto = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link?.photos) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Verify Under Maximum Amount of Link Images
      const imagesBelongToUser = req.link.photos.filter(element => element.cardId === req.card?.requester)
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
      const pathToFile = await awsUploadFile(file.data, req.params.userId, 'link-photo', file.name, file.mimetype)

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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      const images = await db.linkPhoto.findMany({
        where: {
          linkId: req.link.id
        },
        select: {
          pathToFile: true
        }
      })
      return res.status(200).json({
        images,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  /* ADD DELETE IMAGE ROUTE */

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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
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
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  /* Activites */
  // Create Notification
  createNotification = async (req: RequestLink, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, linkControllerParams)
    const { details, directsTo } = params
    try {
      // Confirm req.card & req.link are set
      if (!req.card?.requester || !req.card?.recipient || !req.link) {
        throw Error(messages.LINK_MIDDLEWARE)
      }

      // Validate Input
      const validationError = validateNotification(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Validate details is a cardId
      if (directsTo === 'contact') {
        const isCard = await db.card.findUnique({ where: { cardId: details } })
        if (!isCard) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.NOTIFICATION_CONTACT_INVALID
          })
        }
      }

      // Create and return
      const notification = await db.linkNotification.create({
        data: {
          linkId: req.link.id,
          cardOne: req.link.cardOne,
          cardTwo: req.link.cardTwo,
          ownerId: req.card.recipient,
          details,
          directsTo
        }
      })
      return res.status(200).json({
        notification,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Archive Notification
  archiveNotification = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Update and return
      await db.linkNotification.update({
        where: {
          notificationId: req.params.notificationId
        },
        data: {
          status: 'archived'
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

  // Delete Notification
  deleteNotification = async (req: RequestLink, res: Response): Promise<Response> => {
    try {
      // Delete and return
      await db.linkNotification.delete({
        where: {
          notificationId: req.params.notificationId
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

  // Get Active Notifications
  getActiveNotification = async (req: RequestLink, res: Response): Promise<Response> => {
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

      // Loop through all cards, find notifications and return
      let activeNotifications: INotificationArray[] = []
      for (const card of cards) {
        // Favorites
        const linksWithNotifications = await db.link.findMany({
          where: {
            OR: [
              {
                cardOne: card.cardId,
                notifcations: { some: {} }
              },
              {
                cardTwo: card.cardId,
                notifcations: { some: {} }
              }
            ]
          },
          include: {
            notifcations: {
              where: {
                status: 'active'
              }
            }
          }
        })
        // Get necessary info from notificaitons
        const getInfo = await this.#getInfoNotification(linksWithNotifications)
        if (getInfo) {
          activeNotifications = activeNotifications.concat(getInfo)
        }
      }

      return res.status(200).json({
        activeNotifications,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Get Archived Notifications
  getArchivedNotification = async (req: RequestLink, res: Response): Promise<Response> => {
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

      // Loop through all cards, find notifications and return
      let archivedNotifications: INotificationArray[] = []
      for (const card of cards) {
        // Favorites
        const linksWithNotifications = await db.link.findMany({
          where: {
            OR: [
              {
                cardOne: card.cardId,
                notifcations: { some: {} }
              },
              {
                cardTwo: card.cardId,
                notifcations: { some: {} }
              }
            ]
          },
          include: {
            notifcations: {
              where: {
                status: 'archived'
              }
            }
          }
        })
        // Get necessary info from notificaitons
        const getInfo = await this.#getInfoNotification(linksWithNotifications)
        if (getInfo) {
          archivedNotifications = archivedNotifications.concat(getInfo)
        }
      }

      return res.status(200).json({
        archivedNotifications,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  /* Private Functions */
  #getBaseInfoAllCards = async (arrayLinks: IArrayLink[]): Promise<IArrayLinkWithBaseInfo[] | undefined> => {
    try {
      const returnArray: IArrayLinkWithBaseInfo[] = []
      for (const userCard of arrayLinks) {
        const linkInfo = await this.#getInfoPerCard(userCard)
        if (!linkInfo) {
          throw Error(messages.LINK_CARD_ID_NOT_FOUND)
        }
        returnArray.push({
          myCardId: userCard.cardId,
          Links: linkInfo
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

  #getInfoNotification = async (linksWithNotifications: any): Promise<INotificationArray[] | undefined> => {
    try {
      const returnArray: INotificationArray[] = []
      for (const link of linksWithNotifications) {
        for (const notificaiton of link.notifcations) {
          let otherCardId = notificaiton.cardOne
          if (notificaiton.ownerId === notificaiton.cardOne) {
            otherCardId = notificaiton.cardTwo
          }
          const otherCardInfo = await db.card.findUnique({
            where: {
              cardId: otherCardId
            },
            select: {
              cardId: true,
              slug: true,
              publicCard: true,
              userAvatar: true,
              fullName: true
            }
          })
          if (!otherCardInfo) {
            throw Error(messages.NOTIFACITION_OUT_OF_SYNC)
          }
          const notificaitonInfo = {
            cardId: notificaiton.ownerId,
            notificaiton,
            otherCardInfo
          }
          returnArray.push(notificaitonInfo)
        }
      }
      return returnArray
    } catch (error: any) {
      console.error(error)
    }
  }
}

export default new LinkController()

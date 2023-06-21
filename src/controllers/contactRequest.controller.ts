import { Request, Response } from 'express'
import { UploadedFile } from 'express-fileupload'

import {
  ISearch,
  RequestNotification,
  RequestUserAuth
} from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { sharedContactControllerParams } from '../config/params'
import {
  validateContactSearchType,
  validateSharedContactCreate,
  validateSharedContactNote
} from '../utils/validations/contactRequest.controller.validation'
import { INewContactRequest } from '../config/interfaces/contactRequest.validation.interface'
import { sharedContactStatus } from '../config/enumTypes'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { awsUploadFile } from '../utils/aws-image'

import BaseController from './base.controller'
import notificationController from './notification.controller'
import { db } from '../utils/db'
import { contactRequestEmailer, acceptContactEmailer } from '../utils/emailers'
import { contactRequesterPhone, contactRecieverPhone } from '../utils/smsMessanger'

class ContactRequestController extends BaseController {
  // Create new contact request
  create = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, sharedContactControllerParams)
    const { fullName, company, jobTitle, phone, email, state, city, message, notes, metAt, event } =
      params
    try {
      // Validate input
      const validationError = validateSharedContactCreate(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify card exists
      const card = await db.card.findUnique({ where: { cardId: params.cardId } })
      if (!card) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.CARD_NOT_FOUND
        })
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

      // Check if contact already exists with same email and same card
      const contactExist = await db.contact.findFirst({
        where: {
          email,
          cardId: card.cardId
        }
      })
      if (contactExist) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.CONTACT_EXIST
        })
      }

      const data: INewContactRequest = {
        Contacts: {
          create: {
            fullName,
            company,
            jobTitle,
            phone,
            email,
            city,
            state,
            message,
            notes,
            metAt,
            event
          }
        }
      }

      // Handle Image
      if (req.files) {
        const file = req.files.contactImage as UploadedFile
        if (!file) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: `${messages.INVALID_FILE_LABEL} contactImage`
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
        const contactImage = await awsUploadFile(
          file.data,
          '',
          'contact-request',
          file.name,
          file.mimetype
        )

        data.Contacts.create.contactImage = contactImage
      }

      // Create shared contact and return
      const contactRequest = await db.card.update({
        where: {
          cardId: params.cardId
        },
        data,
        select: {
          Contacts: {
            select: {
              contactId: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      })

      const name = fullName.split(' ')
      const firstName = name.length > 1 ? name[0] : fullName
      const lastName = name.length > 1 ? name[1] : fullName
      const profileData = {
        firstName,
        lastName,
        company,
        profTitle: jobTitle,
        profileAvatar: data.Contacts.create.contactImage,
        state,
        city
      }

      // Create Profile of shared contact and return
      const findProfile = await db.userAuth.findFirst({
        where: { email },
        select: {
          id: true
        }
      })
      if (!findProfile) {
        const profile = await db.userAuth.create({
          data: {
            email,
            phone,
            userBio: {
              create: profileData
            },
            userPreference: { create: {} },
            userNotification: { create: {} }
          },
          select: {
            id: true
          }
        })

        console.log('Created Data ', profile)

        // if (profile) {
        //   const userBio = await db.userAuth.update({
        //     where: {
        //       id: profile.id
        //     },
        //     data: {
        //       userBio: {
        //         create: profileData
        //       },
        //       userPreference: { create: {} },
        //       userNotification: { create: {} }
        //     },
        //     select: {
        //       id: true
        //     }
        //   })
        //   console.log('Bio data ', userBio)
        // }
      }

      const contactId = contactRequest.Contacts[0].contactId

      // Create notification
      const reqNotification: RequestNotification = req
      reqNotification.notification = {
        cardId: params.cardId,
        directsTo: 'contactRequest',
        message,
        idDirectedTo: contactId,
        notificationType: 'contactRequest'
      }

      const notification = await notificationController.createNotification(req)
      if (!notification.success) {
        throw Error(messages.NOTIFICATION_CREATE_CALLED_INCORRECTLY)
      }

      // Send email / text if user allows
      const user = await db.userAuth.findUnique({
        where: {
          id: card.userId
        },
        select: {
          email: true,
          phone: true,
          userNotification: {
            select: {
              newContactRequest: true,
              newContactRequestPhone: true
            }
          }
        }
      })
      if (user?.userNotification?.newContactRequest) {
        await contactRequestEmailer(user.email, card.fullName, params.fullName, card.cardName)
      }
      if (user?.userNotification?.newContactRequestPhone) {
        await contactRecieverPhone(
          user.phone,
          card.fullName,
          params.fullName,
          card.cardName,
          data.Contacts.create.contactImage
        )
      }
      // Always send text to requester
      const cardUrl = `https://hlyx.me/${card.cardId}`
      console.log(card.qrCodeImage)
      await contactRequesterPhone(
        params.phone,
        card.fullName,
        params.fullName,
        cardUrl,
        card.qrCodeImage
      )

      return res.status(200).json({
        contactId,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error.message)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Get all requested contact requests
  getRequested = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          _count: {
            select: {
              Contacts: {
                where: {
                  status: 'requested'
                }
              }
            }
          },
          cardId: true,
          Contacts: {
            where: {
              status: 'requested'
            }
          }
        }
      })

      return res.status(200).json({
        cards,
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

  // Get all saved contact requests
  getSaved = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      const query = this.#getSearchQuery(req.query)
      const { search, searchBy: searchType } = query

      // Find all cards associated with user
      let cardsContacts = []
      if (search && searchType) {
        if (searchType === 'location') {
          const cards = await db.card.findMany({
            where: {
              userId: req.params.userId
            },
            select: {
              _count: {
                select: {
                  Contacts: {
                    where: {
                      status: 'saved',
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
                }
              },
              cardId: true,
              Contacts: {
                where: {
                  status: 'saved',
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
                  contactId: true,
                  cardId: true,
                  contactImage: true,
                  status: true,
                  fullName: true,
                  company: true,
                  jobTitle: true,
                  phone: true,
                  email: true,
                  city: true,
                  state: true,
                  message: true,
                  notes: true,
                  createdAt: true,
                  Card: true
                }
              }
            }
          })
          cardsContacts = cards
        } else {
          const searchBy = searchType === 'name' ? 'fullName' : searchType
          const cards = await db.card.findMany({
            where: {
              userId: req.params.userId
            },
            select: {
              _count: {
                select: {
                  Contacts: {
                    where: {
                      status: 'saved',
                      [searchBy]: {
                        contains: search,
                        mode: 'insensitive'
                      }
                    }
                  }
                }
              },
              cardId: true,
              Contacts: {
                where: {
                  status: 'saved',
                  [searchBy]: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                select: {
                  contactId: true,
                  cardId: true,
                  contactImage: true,
                  status: true,
                  fullName: true,
                  company: true,
                  jobTitle: true,
                  phone: true,
                  email: true,
                  city: true,
                  state: true,
                  message: true,
                  notes: true,
                  createdAt: true,
                  Card: true
                }
              }
            }
          })
          cardsContacts = cards
        }
      } else {
        const cards = await db.card.findMany({
          where: {
            userId: req.params.userId
          },
          select: {
            _count: {
              select: {
                Contacts: {
                  where: {
                    status: 'saved'
                  }
                }
              }
            },
            cardId: true,
            Contacts: {
              where: {
                status: 'saved'
              },
              select: {
                contactId: true,
                cardId: true,
                contactImage: true,
                status: true,
                fullName: true,
                company: true,
                jobTitle: true,
                phone: true,
                email: true,
                city: true,
                state: true,
                message: true,
                notes: true,
                createdAt: true,
                Card: true
              }
            }
          }
        })
        cardsContacts = cards
      }

      return res.status(200).json({
        cards: cardsContacts,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      console.error(error.message)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Get all archived contact requests
  getArchived = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          _count: {
            select: {
              Contacts: {
                where: {
                  status: 'archived'
                }
              }
            }
          },
          cardId: true,
          Contacts: {
            where: {
              status: 'archived'
            }
          }
        }
      })

      return res.status(200).json({
        cards,
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

  updateStatus = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Validate input
      const status = req.body.status
      if (!sharedContactStatus.includes(status)) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_LINK_STATUS
        })
      }

      // Update and return
      const contact = await db.contact.update({
        where: {
          contactId: req.params.contactId
        },
        data: {
          status
        }
      })

      // If status is saved, send email to contact requester
      if (status === 'saved') {
        const card = await db.card.findUnique({
          where: {
            cardId: contact.cardId
          },
          select: {
            fullName: true,
            qrCodeImage: true
          }
        })
        await acceptContactEmailer(
          contact.email,
          contact.fullName,
          card?.fullName ?? '',
          'https://hlyx.me/' + contact.cardId,
          card?.qrCodeImage ?? ''
        )
      }

      return res.status(200).json({
        contact,
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
    const params = this.filterParams(req.body, sharedContactControllerParams)
    const { notes } = params
    try {
      // Validate input
      const validationError = validateSharedContactNote(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Update and return
      const contact = await db.contact.update({
        where: {
          contactId: req.params.contactId
        },
        data: {
          notes
        }
      })

      return res.status(200).json({
        contact,
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

  updateDetails = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, sharedContactControllerParams)
    const { metAt, event } = params
    try {
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
      const contact = await db.contact.update({
        where: {
          contactId: req.params.contactId
        },
        data: {
          metAt,
          event
        }
      })

      return res.status(200).json({
        contact,
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

  deleteContact = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Delete and Return
      await db.contact.delete({ where: { contactId: req.params.contactId } })
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

  #getSearchQuery = (query: ISearch): ISearch => {
    const { search, searchBy } = query
    let searchType = searchBy
    if (search && searchBy) {
      const searchTypeValidationError = validateContactSearchType({ searchBy })
      if (searchTypeValidationError) {
        searchType = ''
      }
    }

    return { search, searchBy: searchType }
  }
}

export default new ContactRequestController()

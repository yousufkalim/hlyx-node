import { Response } from 'express'

import {
  RequestNotification,
  RequestUserAuth,
  ICreateNotification,
  ISharedCard
} from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'

import BaseController from './base.controller'
import { db } from '../utils/db'
import { getSocket } from '../utils/socket'
import { profileShareEmail } from '../utils/emailers'
// import logo from '../assets/dark/logo.png'

class NotificationController extends BaseController {
  // Create Notification (called by other internal functions)
  createNotification = async (req: RequestNotification): Promise<ICreateNotification> => {
    try {
      const NOTIFICATION_TYPES = ['newLinkRequest', 'contactRequest', 'message']
      // Confirm req.notifcation is set
      if (
        !req.notification?.cardId ||
        !req.notification?.directsTo ||
        !req.notification?.idDirectedTo
      ) {
        throw Error(messages.NOTIFICATION_CREATE_CALLED_INCORRECTLY)
      }

      // Validate Input
      if (
        req.notification.directsTo !== 'linkRequest' &&
        req.notification.directsTo !== 'message' &&
        req.notification.directsTo !== 'contactRequest'
      ) {
        throw Error(messages.NOTIFICATION_CREATE_CALLED_INCORRECTLY)
      }

      // Create
      const notifications = await db.card.update({
        where: {
          cardId: req.notification.cardId
        },
        data: {
          Notifications: {
            create: {
              directsTo: req.notification.directsTo,
              message: req.notification.message,
              idDirectedTo: req.notification.idDirectedTo
            }
          }
        },
        select: {
          userId: true,
          Notifications: {
            select: {
              notificationId: true,
              cardId: true,
              status: true,
              message: true,
              directsTo: true,
              idDirectedTo: true
            },
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1
          }
        }
      })

      const notification: any = notifications.Notifications[0]

      const data = await this.#getIdDirectedToDetails(notification)

      // Check user enabled notification setting and Send notification to user
      const { notificationType } = req.notification
      const recipientUser = await db.userAuth.findUnique({
        where: { id: notifications.userId },
        select: {
          userNotification: true
        }
      })
      const sockets = getSocket()
      // Check if user enabled link request notification in settings
      const isNotificationEnabled = !!(
        notificationType &&
        NOTIFICATION_TYPES.includes(notificationType) &&
        recipientUser?.userNotification?.newLinkRequest
      )
      if (sockets && isNotificationEnabled) {
        sockets.emit(`notifications_${notifications.userId}`, { notifications: data })
      }

      return {
        notificationId: notification?.notificationId,
        success: true
      }
    } catch (error: any) {
      console.error(error.message)
      return {
        success: false
      }
    }
  }

  // Create Shared Contact Notification
  createNotificationOfSharedCard = async (
    cardId: string,
    sharedWithLinks: string[],
    details: ISharedCard
  ): Promise<any> => {
    try {
      const response = { success: false }

      // Validate Input
      // Confirm req.notifcation is set
      if (!details?.directsTo || details.directsTo !== 'sharedCard') {
        throw Error(messages.NOTIFICATION_CREATE_CALLED_INCORRECTLY)
      }

      // getting data of shared card
      const obj = { idDirectedTo: cardId, ...details }
      const data = await this.#getIdDirectedToDetails(obj)

      // getting data of shared card
      data.sharedBy = data.cardDirectedTo
      console.log('Shared By => ', details.sharedBy)
      console.log('Card directed To => ', cardId)
      if (details.sharedBy !== cardId) {
        const notificationDetails = { idDirectedTo: details.sharedBy, ...details }
        const res = await this.#getIdDirectedToDetails(notificationDetails)
        console.log('Data directedTo ', res.cardDirectedTo)
        data.sharedBy = res.cardDirectedTo
      }

      if (sharedWithLinks) {
        for (const link of sharedWithLinks) {
          // Create
          const notifications = await db.card.update({
            where: {
              cardId: link
            },
            data: {
              Notifications: {
                create: {
                  directsTo: details.directsTo,
                  message: details.message,
                  idDirectedTo: cardId,
                  sharedBy: details.sharedBy
                }
              }
            },
            select: {
              userId: true,
              fullName: true,
              Notifications: {
                select: {
                  notificationId: true,
                  cardId: true,
                  status: true,
                  message: true,
                  directsTo: true,
                  idDirectedTo: true,
                  sharedBy: true
                },
                orderBy: {
                  updatedAt: 'desc'
                },
                take: 1
              }
            }
          })

          const notification: any = notifications.Notifications[0]
          const socketData = { ...notification, ...data }
          const recipientUser = await db.userAuth.findUnique({
            where: { id: notifications.userId },
            select: {
              email: true,
              userNotification: true
            }
          })

          // Check if user enabled link request notification in settings
          const isNotificationEnabled = recipientUser?.userNotification?.profileShare
          if (isNotificationEnabled) {
            await profileShareEmail(
              recipientUser.email,
              data.sharedBy.fullName,
              notifications.fullName
            )
          }

          const sockets = getSocket()
          if (sockets && isNotificationEnabled) {
            sockets.emit(`notifications_${notifications.userId}`, { notifications: socketData })
          }

          response.success = true
          // return {
          //   notificationId: notificaiton.Notifications[0].notificationId,
          //   success: true
          // }
        }
      }
      return response
    } catch (error: any) {
      console.error(error)
      return {
        success: false
      }
    }
  }

  // Get Active Notifications
  getActiveNotification = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          _count: {
            select: {
              Notifications: {
                where: {
                  status: 'active'
                }
              }
            }
          },
          cardId: true,
          Notifications: {
            where: {
              status: 'active'
            },
            orderBy: {
              updatedAt: 'desc'
            }
          }
        }
      })

      // const data = []
      const data = await Promise.all(
        cards.map(async (card) => {
          const Notifications = await Promise.all(
            card.Notifications.map(async (notification: any) => {
              if (notification.directsTo === 'linkRequest') {
                const res = await db.link.findUnique({
                  where: { id: notification.idDirectedTo },
                  select: {
                    CardOneRef: {
                      select: {
                        fullName: true,
                        cardName: true,
                        cardId: true,
                        userAvatar: true,
                        coverPhoto: true
                      }
                    },
                    CardTwoRef: {
                      select: {
                        fullName: true,
                        cardName: true,
                        cardId: true,
                        userAvatar: true,
                        coverPhoto: true
                      }
                    }
                  }
                })

                if (res?.CardOneRef.cardId === notification.cardId) {
                  notification.cardDirectedTo = res?.CardTwoRef
                } else {
                  notification.cardDirectedTo = res?.CardOneRef
                }

                return {
                  ...notification,
                  // cardDirectedTo: res?.CardOneRef,
                  sharedByRole: 'card',
                  sharedBy: notification.cardDirectedTo
                }
              } else if (notification?.directsTo === 'contactRequest') {
                const res = await db.contact.findUnique({
                  where: { contactId: notification.idDirectedTo },
                  select: {
                    contactImage: true,
                    contactId: true,
                    status: true,
                    fullName: true,
                    company: true,
                    jobTitle: true,
                    message: true,
                    notes: true,
                    city: true,
                    state: true
                  }
                })
                notification.sharedBy = res
                notification.cardDirectedTo = res
                notification.sharedByRole = 'card'

                return {
                  ...notification,
                  sharedBy: res,
                  cardDirectedTo: res,
                  sharedByRole: 'card'
                }
              } else {
                const res = await db.card.findUnique({
                  where: { cardId: notification.idDirectedTo },
                  select: {
                    fullName: true,
                    cardName: true,
                    cardId: true,
                    userAvatar: true,
                    coverPhoto: true
                  }
                })

                if (notification.sharedBy !== notification.idDirectedTo) {
                  const cardDetails = await this.#getCardDetails(notification.sharedBy)
                  notification.sharedBy = cardDetails
                } else {
                  notification.sharedBy = res
                }

                return {
                  ...notification,
                  sharedByRole: 'card',
                  cardDirectedTo: res
                }
              }
            })
          )

          return {
            ...card,
            Notifications
          }
        })
      )

      // const final = await data.map((item) => ({
      //   ...item,
      //   Notifications: item.Notifications.map(async (item1) => await item1)
      // }))
      // console.log('notifications data ', data)
      // console.log('Final data ', final)
      // let allCards = []
      // for (const card of cards) {
      //   allCards.push(card)
      //   if (card.Notifications) {
      //     for (const notification of card.Notifications) {
      //       const not: any = notification
      //       if (notification.idDirectedTo) {
      //         const cardDetails = await db.link.findUnique({
      //           where: { id: notification.idDirectedTo },
      //           select: {
      //             cardOne: true,
      //             cardTwo: true
      //           }
      //         })
      //         if (cardDetails) {
      //           not.directsTo = cardDetails
      //         }
      //       }
      //     }
      //   }
      // }

      return res.status(200).json({
        cards: data,
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

  // Get Archived Notifications
  getArchivedNotification = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Find all cards associated with user
      const cards = await db.card.findMany({
        where: {
          userId: req.params.userId
        },
        select: {
          _count: {
            select: {
              Notifications: {
                where: {
                  status: 'archived'
                }
              }
            }
          },
          cardId: true,
          Notifications: {
            where: {
              status: 'archived'
            },
            orderBy: {
              updatedAt: 'desc'
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

  // Archive Notification
  archiveNotification = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Update and return
      await db.notification.update({
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Delete Notification
  deleteNotification = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Delete and return
      await db.notification.delete({
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  #getIdDirectedToDetails = async (notification: any): Promise<any> => {
    try {
      // Get details of card
      if (notification?.directsTo === 'linkRequest' && notification?.idDirectedTo) {
        const res = await db.link.findUnique({
          where: { id: notification.idDirectedTo },
          select: {
            CardOneRef: {
              select: {
                fullName: true,
                cardName: true,
                cardId: true,
                userAvatar: true,
                coverPhoto: true
              }
            },
            CardTwoRef: {
              select: {
                fullName: true,
                cardName: true,
                cardId: true,
                userAvatar: true,
                coverPhoto: true
              }
            }
          }
        })

        if (res?.CardOneRef.cardId === notification.cardId) {
          notification.cardDirectedTo = res?.CardTwoRef
        } else {
          notification.cardDirectedTo = res?.CardOneRef
        }

        notification.sharedByRole = 'card'
        notification.sharedBy = res
        notification.cardDirectedTo = res?.CardOneRef

        return notification
      } else if (notification?.directsTo === 'contactRequest' && notification?.idDirectedTo) {
        const res = await db.contact.findUnique({
          where: { contactId: notification.idDirectedTo },
          select: {
            contactImage: true,
            contactId: true,
            status: true,
            fullName: true,
            company: true,
            jobTitle: true,
            message: true,
            notes: true,
            city: true,
            state: true
          }
        })
        notification.sharedByRole = 'savedContact'
        notification.sharedBy = res
        notification.cardDirectedTo = res

        return notification
      } else {
        const res = await db.card.findUnique({
          where: { cardId: notification.idDirectedTo },
          select: {
            fullName: true,
            cardName: true,
            cardId: true,
            userAvatar: true,
            coverPhoto: true
          }
        })

        notification.sharedByRole = 'card'
        notification.cardDirectedTo = res

        return notification
      }
    } catch (err) {
      return null
    }
  }

  #getCardDetails = async (cardId: string): Promise<any> => {
    try {
      // Get details of card
      const res = await db.card.findUnique({
        where: { cardId },
        select: {
          fullName: true,
          cardName: true,
          cardId: true,
          userAvatar: true,
          coverPhoto: true
        }
      })
      return res
    } catch (err) {
      return null
    }
  }
}

export default new NotificationController()

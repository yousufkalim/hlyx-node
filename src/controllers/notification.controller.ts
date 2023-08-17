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
      const NOTIFICATION_TYPES = [
        'newLinkRequest',
        'contactRequest',
        'acceptedLinkRequest',
        'message'
      ]
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
        req.notification.directsTo !== 'contactRequest' &&
        req.notification.directsTo !== 'acceptLinkRequest'
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
              message: req.notification?.message,
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

      // Create Notification for Other User accept link request
      if (req.notification.directsTo === 'acceptLinkRequest') {
        const otherNotifications = await db.card.update({
          where: {
            cardId: req.notification.otherCardId
          },
          data: {
            Notifications: {
              create: {
                directsTo: req.notification.directsTo,
                idDirectedTo: req.notification.idDirectedToOther
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

        const otherNotif: any = otherNotifications.Notifications[0]

        const data = await this.#getIdDirectedToDetails(otherNotif)

        // Check user enabled notification setting and Send notification to user
        const { notificationType } = req.notification
        const recipientUser = await db.userAuth.findUnique({
          where: { id: otherNotifications.userId },
          select: {
            userNotification: true
          }
        })
        const sockets = getSocket()
        // Check if user enabled link request notification in settings
        const isNotificationEnabled = !!(
          notificationType &&
          NOTIFICATION_TYPES.includes(notificationType) &&
          recipientUser?.userNotification?.acceptedLinkRequest
        )
        if (sockets && isNotificationEnabled) {
          sockets.emit(`notifications_${otherNotif.userId}`, { notifications: data })
        }
      }

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
      console.log('Notification error ', error.message)
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

      data.sharedBy = details.sharedBy

      // data.sharedBy = data.cardDirectedTo
      // if (details.sharedBy !== cardId) {
      //   const notificationDetails = { idDirectedTo: details.sharedBy, ...details }
      //   const res = await this.#getIdDirectedToDetails(notificationDetails)
      //   const profile = await db.userBio.findUnique({
      //     where: {
      //       id: details.sharedBy
      //     },
      //     select: {
      //       firstName: true,
      //       middleInitial: true,
      //       lastName: true,
      //       company: true,
      //       city: true,
      //       state: true,
      //       country: true
      //     }
      //   })
      //   data.profileDirectedTo = profile
      //   data.sharedBy = res.cardDirectedTo
      // }

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
                  sharedBy: details.sharedBy.id
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
          const senderFullName =
            data.sharedBy.middleInitial && data.sharedBy.middleInitial !== ''
              ? `${data.sharedBy.fullName} ${data.sharedBy.middleInitial} ${data.sharedBy.lastName}`
              : `${data.sharedBy.fullName} ${data.sharedBy.lastName}`

          if (isNotificationEnabled) {
            await profileShareEmail(
              recipientUser.email,
              senderFullName,
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
      const data = await this.#getDetailsForNotifications(cards)

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

      const data = await this.#getDetailsForNotifications(cards)

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

  // Archive Notification
  readNotification = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Update and return
      await db.notification.update({
        where: {
          notificationId: req.params.notificationId
        },
        data: {
          read: true
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
                coverPhoto: true,
                userId: true
              }
            },
            CardTwoRef: {
              select: {
                fullName: true,
                cardName: true,
                cardId: true,
                userAvatar: true,
                coverPhoto: true,
                userId: true
              }
            }
          }
        })

        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        let cardId: any = ''
        if (res?.CardOneRef.cardId === notification.cardId) {
          cardId = res?.CardTwoRef.cardId
        } else {
          cardId = res?.CardOneRef.cardId
        }

        const response = await db.userBio.findFirst({
          where: {
            profileType: 'user',
            cards: {
              some: { cardId }
            }
          },
          select: {
            id: true,
            firstName: true,
            middleInitial: true,
            lastName: true,
            profileAvatar: true,
            profTitle: true,
            company: true,
            city: true,
            state: true
          }
        })

        notification.cardDirectedTo = { ...response, cardId }
        notification.sharedByRole = 'card'
        notification.sharedBy = null

        return notification
      } else if (notification?.directsTo === 'acceptLinkRequest' && notification?.idDirectedTo) {
        const response = await db.userBio.findFirst({
          where: {
            profileType: 'user',
            cards: {
              some: { cardId: notification?.cardId }
            }
          },
          select: {
            id: true,
            firstName: true,
            middleInitial: true,
            lastName: true,
            profileAvatar: true,
            profTitle: true,
            company: true,
            city: true,
            state: true
          }
        })

        notification.cardDirectedTo = { ...response, cardId: notification?.otherCardId }
        notification.sharedByRole = 'card'
        notification.sharedBy = null

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

  #getDetailsForNotifications = async (cards: any): Promise<any> => {
    try {
      const data: any = await Promise.all(
        cards.map(async (card: any) => {
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

                let cardId: any = ''
                if (res?.CardOneRef.cardId === notification.cardId) {
                  cardId = res?.CardTwoRef.cardId
                } else {
                  cardId = res?.CardOneRef.cardId
                }

                const response = await db.userBio.findFirst({
                  where: {
                    profileType: 'user',
                    cards: {
                      some: { cardId }
                    }
                  },
                  select: {
                    id: true,
                    firstName: true,
                    middleInitial: true,
                    lastName: true,
                    profileAvatar: true,
                    profTitle: true,
                    company: true,
                    city: true,
                    state: true
                  }
                })
                // notification.cardDirectedTo = { ...response, cardId }

                return {
                  ...notification,
                  cardDirectedTo: { ...response, cardId },
                  sharedByRole: 'card',
                  sharedBy: null
                }
              } else if (notification.directsTo === 'acceptLinkRequest') {
                const response = await db.userBio.findUnique({
                  where: {
                    id: notification.idDirectedTo
                  },
                  select: {
                    id: true,
                    firstName: true,
                    middleInitial: true,
                    lastName: true,
                    profileAvatar: true,
                    profTitle: true,
                    company: true,
                    city: true,
                    state: true
                  }
                })
                // notification.cardDirectedTo = { ...response, cardId }

                return {
                  ...notification,
                  cardDirectedTo: { ...response, cardId: notification.cardId },
                  sharedByRole: 'card',
                  sharedBy: null
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
              } else if (notification?.directsTo === 'sharedCard') {
                const res = await db.userBio.findFirst({
                  where: {
                    cards: {
                      some: { cardId: notification.idDirectedTo }
                    }
                  },
                  select: {
                    firstName: true,
                    middleInitial: true,
                    lastName: true,
                    profileAvatar: true
                  }
                })

                // Get profile of person that shared
                const profile = await db.userBio.findUnique({
                  where: {
                    id: notification.sharedBy
                  },
                  select: {
                    firstName: true,
                    middleInitial: true,
                    lastName: true,
                    company: true,
                    city: true,
                    state: true,
                    country: true
                  }
                })
                // data.sharedBy = profile

                return {
                  ...notification,
                  sharedBy: profile,
                  sharedByRole: 'card',
                  cardDirectedTo: res
                }
              } else {
                const res = await db.card.findUnique({
                  where: { cardId: notification.idDirectedTo },
                  select: {
                    fullName: true,
                    cardName: true,
                    cardId: true,
                    userAvatar: true,
                    coverPhoto: true,
                    userId: true
                  }
                })

                if (notification.sharedBy !== notification.idDirectedTo) {
                  const cardDetails = await this.#getCardDetails(notification.sharedBy)
                  notification.sharedBy = cardDetails
                  // Get profile of person that shared
                  // const profile = await db.userBio.findUnique({
                  //   where: {
                  //     id: notification.sharedBy
                  //   },
                  //   select: {
                  //     firstName: true,
                  //     middleInitial: true,
                  //     lastName: true,
                  //     company: true,
                  //     city: true,
                  //     state: true,
                  //     country: true
                  //   }
                  // })
                  // data.profileDirectedTo = profile
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

      return data
    } catch (err: any) {
      return []
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

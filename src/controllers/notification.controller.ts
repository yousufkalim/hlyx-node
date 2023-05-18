import { Response } from 'express'

import {
  RequestNotification,
  RequestUserAuth,
  ICreateNotification
} from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'

import BaseController from './base.controller'
import { db } from '../utils/db'

class NotificationController extends BaseController {
  // Create Notification (called by other internal functions)
  createNotification = async (req: RequestNotification): Promise<ICreateNotification> => {
    try {
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
      const notificaiton = await db.card.update({
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
          Notifications: {
            select: {
              notificationId: true
            },
            orderBy: {
              updatedAt: 'desc'
            },
            take: 1
          }
        }
      })

      return {
        notificationId: notificaiton.Notifications[0].notificationId,
        success: true
      }
    } catch (error: any) {
      console.error(error)
      return {
        success: false
      }
    }
  }

  // Create Shared Contact Notification

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
}

export default new NotificationController()

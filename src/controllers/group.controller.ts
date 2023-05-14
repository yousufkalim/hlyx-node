import { Response } from 'express'
import { UploadedFile } from 'express-fileupload'
import { codes } from '../config/codes'
import { ACCEPTABLE_MIME_TYPES, MAX_BYTES } from '../config/fileLimits'
import { RequestUserAuth } from '../config/interfaces/common.interface'
import { messages } from '../config/messages'
import { groupControllerParams } from '../config/params'
import { awsUploadFile } from '../utils/aws-image'
import { db } from '../utils/db'
import { validateGroupCreate } from '../utils/validations/group.controller.validation'
import BaseController from './base.controller'

class Groups extends BaseController {
  getAllGroups = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    try {
      const groups = await db.userBio.findUnique({
        where: {
          id: req.params.userId
        },
        select: {
          Group: {
            select: {
              id: true,
              groupName: true,
              isPrivate: true,
              description: true,
              groupPhoto: true,
              tags: true,
              members: {
                select: {
                  User: {
                    select: {
                      id: true,
                      profileAvatar: true,
                      firstName: true,
                      lastName: true,
                      profTitle: true
                    }
                  }
                }
              },
              createdAt: true
            }
          }
        }
      })
      return res.status(200).json({
        code: codes.OK,
        groups
      })
    } catch (error: any) {
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }

  getGroupDetails = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    try {
      const groups = await db.group.findUnique({
        where: {
          id: req.params.groupId
        },
        select: {
          id: true,
          groupName: true,
          isPrivate: true,
          description: true,
          tags: true,
          groupPhoto: true,
          members: {
            select: {
              User: {
                select: {
                  id: true,
                  profileAvatar: true,
                  firstName: true,
                  lastName: true,
                  profTitle: true
                }
              }
            }
          },
          createdAt: true
        }
      })
      return res.status(200).json({
        code: codes.OK,
        groups
      })
    } catch (error: any) {
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }

  createGroup = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    try {
      // Filter body params
      const params = this.filterParams(req.body, groupControllerParams)

      // validation on paramters
      const validationError = validateGroupCreate(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      const groupData = { ...params, adminUser: req.params.userId }

      const groupMembers = params.members

      /*  ====  Validation for Group Photo  ===== */
      const groupPhoto = req.files?.groupPhoto as UploadedFile
      if (groupPhoto) {
        // Verify Acceptable MIME Type
        if (!ACCEPTABLE_MIME_TYPES.includes(groupPhoto.mimetype)) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_MIME_TYPE
          })
        }
        // Verify Image Size
        if (groupPhoto.size > MAX_BYTES) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.FILE_SIZE_OVER_10
          })
        }

        // AWS API Call
        const groupPhotoPath = await awsUploadFile(
          groupPhoto.data,
          req.body.id,
          'group-photo',
          groupPhoto.name,
          groupPhoto.mimetype
        )
        groupData.groupPhoto = groupPhotoPath
      }

      // If group members addded
      const userMembers: any = []

      // Check if user exist in database
      const promise = new Promise((resolve) => {
        if (groupMembers) {
          groupMembers.forEach(async function (member: string) {
            const isMemberUser = await db.userBio.findUnique({
              where: {
                id: member
              }
            })
            if (!isMemberUser) {
              return res.status(400).json({
                code: codes.BAD_REQUEST,
                message: messages.GROUP_MEMBER_NOT_USER
              })
            }
            userMembers.push({
              User: {
                connect: {
                  id: member
                }
              }
            })
            resolve(true)
          })
        } else {
          resolve(true)
        }
      })

      userMembers.push({
        User: {
          connect: {
            id: req.params.userId
          }
        }
      })

      return await promise.then(async () => {
        // query to add users in group
        const members = {
          create: userMembers
        }

        groupData.members = members
        const groupResponse = await db.group.create({
          data: groupData,
          select: {
            groupName: true,
            members: true
          }
        })

        return res.status(201).json({
          group: groupResponse,
          code: codes.OK,
          message: messages.SUCCESS
        })
      })
    } catch (error: any) {
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }

  updateGroup = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    try {
      // Filter body params
      const params = this.filterParams(req.body, groupControllerParams)
      const groupData = { ...params }
      const paramMembers = params.members

      const group = await db.group.findUnique({
        where: {
          id: req.params.groupId
        },
        select: {
          id: true,
          members: true,
          adminUser: true,
          groupName: true
        }
      })

      // validation on paramters
      const validationError = validateGroupCreate(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      /*  ====  Validation for Group Photo  ===== */
      const groupPhoto = req.files?.groupPhoto as UploadedFile
      if (groupPhoto) {
        // Verify Acceptable MIME Type
        if (!ACCEPTABLE_MIME_TYPES.includes(groupPhoto.mimetype)) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.INVALID_MIME_TYPE
          })
        }
        // Verify Image Size
        if (groupPhoto.size > MAX_BYTES) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.FILE_SIZE_OVER_10
          })
        }

        // AWS API Call
        const groupPhotoPath = await awsUploadFile(
          groupPhoto.data,
          req.body.id,
          'group-photo',
          groupPhoto.name,
          groupPhoto.mimetype
        )
        groupData.groupPhoto = groupPhotoPath
      }

      // If group members exists
      if (paramMembers?.length > 0) {
        const userMembers: any = []

        // Remove members from group
        const removedMembers = group?.members.filter((item: any) => !paramMembers.includes(item))
        const filteredRemovedMembers = removedMembers
          ?.filter((item) => item.userId !== group?.adminUser)
          .map((item) => item.userId)
        if (removedMembers) {
          // Delete Records from GroupsOnUsers table except admin
          await db.groupsOnUsers.deleteMany({
            where: {
              groupId: group?.id,
              userId: {
                in: filteredRemovedMembers
              }
            }
          })
        }

        // For Newly add members: Check if user exist in database
        const addedMembers = paramMembers.filter((item: any) => !group?.members.includes(item))
        const promise = new Promise((resolve) => {
          addedMembers.forEach(async function (member: string) {
            const isMemberUser = await db.userBio.findUnique({
              where: {
                id: member
              }
            })
            if (!isMemberUser) {
              return res.status(400).json({
                code: codes.BAD_REQUEST,
                message: messages.GROUP_MEMBER_NOT_USER
              })
            }
            userMembers.push({
              User: {
                connect: {
                  id: member
                }
              }
            })
            resolve(true)
          })
        })

        // query to add members in group
        return await promise.then(async () => {
          const members = {
            create: userMembers
          }

          groupData.members = members
          const groupResponse = await db.group.update({
            where: {
              id: req.params.groupId
            },
            data: groupData,
            select: {
              groupName: true,
              members: true
            }
          })

          return res.status(201).json({
            group: groupResponse,
            code: codes.OK,
            message: messages.SUCCESS
          })
        })
      }

      // Remove Group members except admin
      await db.groupsOnUsers.deleteMany({
        where: {
          groupId: group?.id,
          userId: {
            not: group?.adminUser
          }
        }
      })
      // Commented for disconnecting purpose if needed
      // const filteredMembers = group?.members.filter((item) => item.userId !== group.adminUser)
      // const deleteMembers = filteredMembers?.map((member) => ({
      //   userId_groupId: { userId: member.userId, groupId: member.groupId }
      // }))
      // console.log('Delete members => ', deleteMembers)
      const groupResponse = await db.group.update({
        where: {
          id: group?.id
        },
        data: {
          ...groupData
          // members: {
          //   disconnect: deleteMembers
          // }
        },
        select: {
          groupName: true,
          members: true
        }
      })
      return res.status(200).json({
        group: groupResponse,
        code: codes.OK,
        message: messages.SUCCESS
      })
    } catch (error: any) {
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }

  deleteGroup = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    try {
      return res.status(200).json({
        code: codes.OK
      })
    } catch (error: any) {
      return res.status(500).json({
        code: codes.INTERNAL_SERVER_ERROR,
        message: messages.SERVER_FAILURE
      })
    }
  }
}

const GroupController = new Groups()

export default GroupController

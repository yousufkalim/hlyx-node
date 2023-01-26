// import { Response } from 'express'

// import { RequestUserAuth } from '../config/interfaces/common.interface'
// import { codes } from '../config/codes'
// import { messages } from '../config/messages'
// import { userControllerParams } from '../config/params'
// import { validateUserUpdate, validateNameUpdate, validateProfileImageUpdate } from '../utils/validations/user.controller.validation'
// import { IValidateCardCreate } from '../config/interfaces/card.validation.interface'
// import { cardTypes } from '../config/enumTypes'
// import BaseController from './base.controller'

// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

// class UserController extends BaseController {
//   // Return logged in User's Bio
//   me = async (req: RequestUserAuth, res: Response): Promise<Response> => {
//     try {
//       // Verify user exists
//       const user = await prisma.userBio.findUnique({
//         where: {
//           id: req.user?.id
//         }
//       })
//       if (user === null) {
//         return res.status(404).json({
//           code: codes.NOT_FOUND,
//           message: messages.USER_NOT_FOUND
//         })
//       }

//       return res.status(200).json({
//         user,
//         code: codes.OK,
//         message: messages.SUCCESS
//       })
//     } catch (error: any) {
//       console.error(error)
//       return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
//     }
//   }

//   // Update user via id passed as param
//   updateBio = async (req: RequestUserAuth, res: Response): Promise<Response> => {
//     const params = this.filterParams(req.body, userControllerParams)
//     const { firstName, middleInitial, lastName, phone, profession, profTitle, industry, profRole, website } = params
//     try {
//       // Validate input
//       const validationError = validateUserUpdate(params)
//       if (validationError != null) {
//         return res.status(400).json({
//           code: codes.BAD_REQUEST,
//           message: validationError
//         })
//       }

//       // Verify user exists
//       const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } })
//       if (user === null) {
//         return res.status(404).json({ code: codes.NOT_FOUND, message: messages.USER_NOT_FOUND })
//       }

//       const userBioObject: any = {
//         firstName,
//         middleInitial,
//         lastName,
//         profession,
//         profTitle,
//         industry,
//         profRole,
//         website
//       }

//       // Only update phone in this route if null
//       if (user.phone === null) {
//         // Verify uniqueness of phone
//         const phoneUnique = await prisma.user.findUnique({ where: phone })
//         if (phoneUnique !== null) {
//           return res.status(400).json({
//             code: codes.BAD_REQUEST,
//             message: `${messages.USER_ALREADY_EXIST} with phone number: "${phone}"`
//           })
//         }
//         userBioObject.phone = phone
//       }

//       // Update and return
//       await prisma.user.update({
//         where: { id: parseInt(req.params.id) },
//         data: userBioObject
//       })
//       return res.status(200).json({
//         code: codes.OK,
//         message: messages.SUCCESS
//       })
//     } catch (error: any) {
//       console.error(error)
//       return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
//     }
//   }
// }

// export default new UserController()

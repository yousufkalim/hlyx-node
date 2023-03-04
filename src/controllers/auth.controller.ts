import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { RequestUserAuth } from '../config/interfaces/common.interface'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { expirationTimes } from '../config/expirationTime'
import BaseController from './base.controller'
import { authControllerParams } from '../config/params'
import { config } from '../config/env.config.validations'
import { sendCodeToEmail, sendCodeToPhone } from '../utils/helper'
import { twilioClient } from '../utils/twilio'
import { validateLogin, validateRegister, validateSendVerificationCode, validateVerifyCode, validatePhone, validateVerifyPhone } from '../utils/validations/auth.controller.validation'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class AuthController extends BaseController {
  // Login in user
  login = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, password } = params
    try {
      // Validate input
      const validationError = validateLogin(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { email } })
      if (user === null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CREDENTIALS
        })
      }

      if (user.isPaused) {
        if (user.isDeleted) {
          const currentTime = new Date()
          let diff = currentTime.getTime() - user.createdAt.getTime()
          // Milisecond to day conversion
          diff = diff / (86400000)
          if (diff > expirationTimes.DAYS_FOR_PERMA_DELETE) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.DELETED_30_DAYS
            })
          }
          // Update Deleted and Paused flags (reactivate account)
          await prisma.userAuth.update({
            where: {
              email
            },
            data: {
              isPaused: false,
              isDeleted: false
            }
          })
        } else {
          // Update Paused Flag
          await prisma.userAuth.update({
            where: {
              email
            },
            data: {
              isPaused: false
            }
          })
        }
      }

      // Check passwords match
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CREDENTIALS
        })
      }

      // Return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
          email: user.email
        }
      }
      jwt.sign(
        payload,
        config.get('jwt_secret_key') as string,
        { expiresIn: config.get('jwt_secret_key_expiry') as string },
        (err, token) => {
          if (err != null) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.TOKEN_FAILURE
            })
          }
          return res.status(200).json({
            token,
            code: codes.OK,
            message: messages.USER_LOGGED_IN
          })
        }
      )
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Register new user
  register = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, password } = params
    try {
      // Validate input
      const validationError = validateRegister(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Check if email is already registered
      const userWithEmail = await prisma.userAuth.findUnique({ where: { email } })
      if (userWithEmail != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.USER_ALREADY_EXIST} with email "${email}"`
        })
      }

      // Encrypt password
      const salt = await bcrypt.genSalt(10)
      const data = {
        email,
        password: await bcrypt.hash(password, salt),
        userBio: { create: {} }
      }

      // Create User
      const createUser = await prisma.userAuth.create({ data })

      // Return jsonwebtoken
      const payload = {
        user: {
          id: createUser.id,
          email: createUser.email
        }
      }
      jwt.sign(
        payload,
        config.get('jwt_secret_key') as string,
        { expiresIn: config.get('jwt_secret_key_expiry') as string },
        async (err, token) => {
          if (err != null) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.TOKEN_FAILURE
            })
          }
          await sendCodeToEmail(email)
          return res.status(201).json({
            token,
            code: codes.CREATED,
            message: messages.CODE_SENT_SUCCESS
          })
        }
      )
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Send verification code to specified email
  sendCodeEmail = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email } = params
    try {
      // Validate input
      const validationError = validateSendVerificationCode(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { email } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      // Send email and return
      await sendCodeToEmail(email)
      return res.status(200).json({
        code: codes.OK,
        message: messages.CODE_SENT_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Verify code from email
  verifyCodeEmail = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, code } = params
    try {
      // Validate input
      const validationError = validateVerifyCode(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { email } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      // Twilio verify
      const verification = await twilioClient.verify.v2
        .services(config.get('email_verification_sid') as string)
        .verificationChecks.create({ to: email, code })

      if (verification.status !== 'approved') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CODE
        })
      }

      // Update User and return
      await prisma.userAuth.update({
        where: { email },
        data: {
          isEmailVerified: true
        }
      })

      return res.status(200).json({
        code: codes.OK,
        message: messages.VERIFIED_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Verify code prepare for password reset
  verifyCodePassword = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, code } = params
    try {
      // Validate input
      const validationError = validateVerifyCode(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { email } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      // Twilio verify
      const verification = await twilioClient.verify.v2
        .services(config.get('email_verification_sid') as string)
        .verificationChecks.create({ to: email, code })

      if (verification.status !== 'approved') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CODE
        })
      }

      // Update User and return
      await prisma.userAuth.update({
        where: { email },
        data: {
          passwordReset: new Date()
        }
      })

      return res.status(200).json({
        code: codes.OK,
        message: messages.VERIFIED_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Password
  forgotPassword = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, password } = params
    try {
      // Verify Input
      const validationError = validateRegister(params)
      if (validationError != null) {
        return res.status(400).json({ code: codes.BAD_REQUEST, message: validationError })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { email } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      // Verify password reset flag has been set in last 5 minutes
      if (user.passwordReset == null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          messgae: messages.PASSWORD_RESET_FLAG
        })
      } else {
        const currentTime = new Date()
        let diff = currentTime.getTime() - user.createdAt.getTime()
        // Milisecond to day minute
        diff = diff / (60000)
        if (diff > expirationTimes.MINUTES_FOR_PASSWORD_RESET) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            messgae: messages.PASSWORD_RESET_FLAG
          })
        }
      }

      // Update User and return
      const salt = await bcrypt.genSalt(10)
      await prisma.userAuth.update({
        where: { email },
        data: {
          password: await bcrypt.hash(password, salt),
          passwordReset: null
        }
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.PASSWORD_CHANGED_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Phone
  updatePhone = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { phone } = params
    try {
      // Verify Input
      const validationError = validatePhone(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Check phone uniqueness
      const uniqueness = await prisma.userAuth.findUnique({ where: { phone } })
      if (uniqueness !== null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.USER_ALREADY_EXIST} with phone "${phone}"`
        })
      }

      // Update User and return
      await prisma.userAuth.update({
        where: {
          id: parseInt(req.params.id)
        },
        data: {
          phone,
          isPhoneVerified: false
        }
      })
      await prisma.userBio.update({
        where: {
          id: parseInt(req.params.id)
        },
        data: {
          phone
        }
      })
      return res.status(200).json({
        code: codes.OK,
        message: messages.PHONE_UPDATED
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Send verification code to specified phone
  sendCodePhone = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { phone } = params
    try {
      // Validate input
      const validationError = validatePhone(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { phone } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${phone}" does not exist`
        })
      }
      // Send code and return
      await sendCodeToPhone(phone)
      return res.status(200).json({
        code: codes.OK,
        message: messages.CODE_SENT_PHONE_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Verify code from phone
  verifyCodePhone = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { phone, code } = params
    try {
      // Validate input
      const validationError = validateVerifyPhone(params)
      if (validationError != null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { phone } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${phone}" does not exist`
        })
      }

      // Twilio verify +1 is for USA only
      const verification = await twilioClient.verify.v2
        .services(config.get('sms_verification_sid') as string)
        .verificationChecks.create({ to: `+1${phone}`, code })

      if (verification.status !== 'approved') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CODE
        })
      }

      // Update User and return
      await prisma.userAuth.update({
        where: { phone },
        data: {
          isPhoneVerified: true
        }
      })

      return res.status(200).json({
        code: codes.OK,
        message: messages.VERIFIED_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Pause Account
  pauseAccount = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Update User and return
      await prisma.userAuth.update({
        where: {
          id: parseInt(req.params.id)
        },
        data: {
          isPaused: true
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

  // Delete Account (trigger boolean)
  deleteAcount = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify User exists
      const user = await prisma.userAuth.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user == null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Update User and return
      await prisma.userAuth.update({
        where: {
          id: parseInt(req.params.id)
        },
        data: {
          isDeleted: true,
          isPaused: true
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

  // Delete user (UNUSED)
  delete = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await prisma.userAuth.findUnique({ where: { id: parseInt(req.params.id) } })
      if (user === null) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      await prisma.userAuth.delete({ where: { id: parseInt(req.params.id) } })

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

export default new AuthController()

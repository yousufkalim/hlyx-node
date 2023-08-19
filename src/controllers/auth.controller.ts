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
import { sendCodeToPhone } from '../utils/smsMessanger'
import { twilioClient } from '../utils/twilio'
import {
  validateLogin,
  validateRegister,
  validateSendVerificationCode,
  validateEmailUpdate,
  validateVerifyCode,
  validatePhone,
  validateVerifyPhone
} from '../utils/validations/auth.controller.validation'
import { verifyEmailEmailer, passwordResetEmailer } from '../utils/emailers'
import { successHTML } from '../utils/html-templates/success'
import { failureHTML } from '../utils/html-templates/failure'
import { db } from '../utils/db'

class AuthController extends BaseController {
  // Login in user
  login = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, password, keepSignIn } = params
    try {
      // Validate input
      const validationError = validateLogin(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }
      // Verify User exists
      const user = await db.userAuth.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          isPaused: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
          password: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          userPreference: {
            select: {
              twoFactorAuth: true
            }
          }
        }
      })
      if (!user) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CREDENTIALS
        })
      }

      if (!user.isEmailVerified) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.EMAIL_NOT_VERIFIED
        })
      }

      // Handle Pause / Deleted Flags if set
      if (user.isPaused) {
        if (user.isDeleted) {
          const currentTime = new Date()
          let diff = currentTime.getTime() - user.updatedAt.getTime()
          // Milisecond to day conversion
          diff = diff / 86400000
          if (diff > expirationTimes.DAYS_FOR_PERMA_DELETE) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.DELETED_30_DAYS
            })
          }
          // Update Deleted and Paused flags (reactivate account)
          await db.userAuth.update({
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
          await db.userAuth.update({
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
      const isMatch = await bcrypt.compare(password, user.password ?? '')
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
      const expiry = keepSignIn
        ? config.get('jwt_secret_key_long_expiry')
        : config.get('jwt_secret_key_expiry')
      const expiryDuration: string = expiry ?? '1d'

      jwt.sign(
        payload,
        config.get('jwt_secret_key') as string,
        { expiresIn: expiryDuration },
        (err, token) => {
          console.log('Error ', err)
          if (err) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.TOKEN_FAILURE
            })
          }
          return res.status(200).json({
            token,
            id: user.id,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            code: codes.OK,
            message: messages.USER_LOGGED_IN
          })
        }
      )
    } catch (error: any) {
      console.log('Error ', error)
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Login in user
  loginWith2FA = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, code, keepSignIn } = params
    try {
      // Validate input
      const validationError = validateVerifyCode(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await db.userAuth.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          isPaused: true,
          isDeleted: true,
          createdAt: true,
          password: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          userPreference: {
            select: {
              twoFactorAuth: true
            }
          }
        }
      })
      if (!user) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CREDENTIALS
        })
      }

      // Twilio verify
      let twilioFound = true
      const verification = await twilioClient.verify.v2
        .services(config.get('email_verification_sid') as string)
        .verificationChecks.create({ to: email, code })
        .catch((error) => {
          console.error(error)
          twilioFound = false
        })

      if (!twilioFound) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.TWILIO_NOT_FOUND
        })
      }

      if (verification?.status !== 'approved') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CODE
        })
      }

      const payload = {
        user: {
          id: user.id,
          email: user.email
        }
      }
      const expiry = keepSignIn
        ? config.get('jwt_secret_key_long_expiry')
        : config.get('jwt_secret_key_expiry')

      const expiryDuration: string = expiry ?? '1d'

      jwt.sign(
        payload,
        config.get('jwt_secret_key') as string,
        { expiresIn: expiryDuration },
        (err, token) => {
          if (err) {
            return res.status(400).json({
              code: codes.BAD_REQUEST,
              message: messages.TOKEN_FAILURE
            })
          }
          return res.status(200).json({
            token,
            id: user.id,
            isEmailVerified: user.isEmailVerified,
            isPhoneVerified: user.isPhoneVerified,
            code: codes.OK,
            message: messages.USER_LOGGED_IN
          })
        }
      )
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Register new user
  register = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, password } = params
    try {
      // Validate input
      const validationError = validateRegister(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      const salt = await bcrypt.genSalt(10)
      const data: any = {
        email,
        password: await bcrypt.hash(password, salt)
      }

      // Check if contact request user exists
      const savedContactUser = await db.contact.findFirst({ where: { email } })
      // Check if email is already registered
      const userWithEmail = await db.userAuth.findUnique({ where: { email } })
      if (
        (userWithEmail && !savedContactUser) ||
        (userWithEmail && savedContactUser && userWithEmail?.isEmailVerified)
      ) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.USER_ALREADY_EXIST} with email "${email}"`
        })
      } else if (savedContactUser) {
        const response = await db.userAuth.update({
          where: {
            email
          },
          data
        })

        await verifyEmailEmailer(email, false)
        return res.status(201).json({
          id: response.id,
          code: codes.CREATED,
          message: messages.LINK_SENT_SUCCESS
        })
      }

      data.userBio = { create: {} }
      data.userPreference = { create: {} }
      data.userNotification = { create: {} }

      // Create User
      const createUser = await db.userAuth.create({ data })

      // Emailer
      await verifyEmailEmailer(email, false)
      return res.status(201).json({
        id: createUser.id,
        code: codes.CREATED,
        message: messages.LINK_SENT_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Navigation Helper
  navigationHelper = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    try {
      /* IDK WHY USERBIO RETURNS NULL ON SELECT HERE SO THIS IS THE WORK AROUND FOR NOW */
      // Verify User Exists
      const user = await db.userAuth.findUnique({
        where: {
          id: req.user?.id
        },
        select: {
          isEmailVerified: true,
          isPhoneVerified: true,
          userBio: {
            select: {
              isOnBoardingComplete: true
            }
          }
        }
      })
      /* WORK AROUND */
      const userBio = await db.userBio.findUnique({
        where: {
          id: req.user?.id
        },
        select: {
          isOnBoardingComplete: true,
          User: {
            select: {
              isEmailVerified: true
            }
          }
        }
      })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }
      return res.status(200).json({
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isOnboardingComplete: userBio?.isOnBoardingComplete,
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

  // Resend Verification Email
  resendVerificationEmail = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, landingPage } = params
    try {
      // Validate input
      const validationError = validateSendVerificationCode(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await db.userAuth.findUnique({ where: { email } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      // Send email and return
      await verifyEmailEmailer(email, landingPage)
      return res.status(200).json({
        code: codes.OK,
        message: messages.CODE_SENT_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Send Password Reset Email
  passwordResetEmail = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email } = params
    try {
      // Validate input
      const validationError = validateSendVerificationCode(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await db.userAuth.findUnique({ where: { email } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      // Send email and return
      await passwordResetEmailer(email)
      return res.status(200).json({
        code: codes.OK,
        message: messages.CODE_SENT_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Verify Code via URL
  verifyCodeURL = async (req: Request, res: Response): Promise<Response> => {
    try {
      const email = req.query.email as string
      const code = req.query.code as string
      const params = {
        email,
        code
      }

      // Validate input
      const validationError = validateVerifyCode(params)
      if (validationError) {
        res.status(400)
        throw Error(validationError)
      }

      // Verify User exists
      const user = await db.userAuth.findUnique({ where: { email } })
      if (!user) {
        res.status(400)
        throw Error(`User with "${email}" does not exist`)
      }

      // Twilio verify
      let twilioFound = true
      const verification = await twilioClient.verify.v2
        .services(config.get('email_verification_sid') as string)
        .verificationChecks.create({ to: email, code })
        .catch((error) => {
          console.error(error)
          twilioFound = false
        })

      if (!twilioFound) {
        res.status(401)
        throw Error(messages.TWILIO_NOT_FOUND)
      }

      if (verification?.status !== 'approved') {
        res.status(401)
        throw Error(messages.INVALID_CODE)
      }

      // Update User and return
      await db.userAuth.update({
        where: { email },
        data: {
          isEmailVerified: true
        }
      })

      res.status(200).send(successHTML)
      return res
    } catch (error: any) {
      console.error(error)
      if (!res.status) {
        res.status(500)
      }
      res.send(failureHTML)
      return res
    }
  }

  // Verify code prepare for password reset
  verifyCodePassword = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, code } = params
    try {
      // Validate input
      const validationError = validateVerifyCode(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await db.userAuth.findUnique({ where: { email } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      // Twilio verify
      let twilioFound = true
      const verification = await twilioClient.verify.v2
        .services(config.get('email_password_reset_sid') as string)
        .verificationChecks.create({ to: email, code })
        .catch((error) => {
          console.error(error)
          twilioFound = false
        })

      if (!twilioFound) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.TWILIO_NOT_FOUND
        })
      }

      if (verification?.status !== 'approved') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CODE
        })
      }

      // Update User and return
      await db.userAuth.update({
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
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Password
  forgotPassword = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, password } = params
    try {
      // Verify Input
      const validationError = validateRegister(params)
      if (validationError) {
        return res.status(400).json({ code: codes.BAD_REQUEST, message: validationError })
      }

      // Verify User exists
      const user = await db.userAuth.findUnique({
        where: { email },
        select: {
          password: true,
          passwordReset: true
        }
      })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: `User with "${email}" does not exist`
        })
      }

      const userPassword = user.password as string
      const isMatchedWithOldPassword = await bcrypt.compare(password, userPassword)

      if (isMatchedWithOldPassword) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.USER_OLD_PASSWORD_MATCH
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
        let diff = currentTime.getTime() - user.passwordReset.getTime()
        // Milisecond to day minute
        diff = diff / 60000
        if (diff > expirationTimes.MINUTES_FOR_PASSWORD_RESET) {
          return res.status(400).json({
            code: codes.BAD_REQUEST,
            message: messages.PASSWORD_RESET_FLAG
          })
        }
      }

      // Update User and return
      const salt = await bcrypt.genSalt(10)
      await db.userAuth.update({
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update email
  /*
   *
   *
   * Final functionality has not been discussed yet but I have set it up as
   * if we require OTP text message to allow user to change email. That is why
   * phone is being included and used to verify user
   *
   *
   */
  updateEmail = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, phone, code } = params
    try {
      // Validate input
      const validationError = validateEmailUpdate(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Phone belongs to a user
      const user = await db.userBio.findUnique({ where: { phone } })
      if (!user) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `User with "${phone}" does not exist`
        })
      }

      // Verify unique Email is not already used
      const uniqueness = await db.userAuth.findUnique({ where: { email } })
      if (uniqueness) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.USER_ALREADY_EXIST} with email "${email}"`
        })
      }

      // Twilio verify +1 is for USA only
      let twilioFound = true
      const verification = await twilioClient.verify.v2
        .services(config.get('sms_verification_sid') as string)
        .verificationChecks.create({ to: `${phone}`, code })
        .catch((error) => {
          console.error(error)
          twilioFound = false
        })
      if (!twilioFound) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.TWILIO_NOT_FOUND
        })
      }

      if (verification?.status !== 'approved') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CODE
        })
      }

      // Update User and return
      await db.userAuth.update({
        where: { id: user.id },
        data: {
          email,
          isEmailVerified: false
        }
      })

      return res.status(200).json({
        code: codes.OK,
        message: messages.EMAIL_UPDATED
      })
    } catch (error: any) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Send verification code to specified phone
  sendCodePhone = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { phone } = params
    try {
      // Validate input
      const validationError = validatePhone(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify Phone associate with user or not
      const user = await db.userBio.findUnique({ where: { phone } })
      if (user) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `User with "${phone}" already exist`
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
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Verify code from phone
  verifyCodePhone = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { phone, code } = params
    try {
      // Validate input
      const validationError = validateVerifyPhone(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Twilio verify +1 is for USA only
      let twilioFound = true
      const verification = await twilioClient.verify.v2
        .services(config.get('sms_verification_sid') as string)
        .verificationChecks.create({ to: `${phone}`, code })
        .catch((error) => {
          console.error(error)
          twilioFound = false
        })
      if (!twilioFound) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.TWILIO_NOT_FOUND
        })
      }

      if (verification?.status !== 'approved') {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.INVALID_CODE
        })
      }

      // Update User and return
      const data: any = {
        userBio: {
          update: {
            phone
          }
        },
        isPhoneVerified: true
      }

      const user = await db.userBio.findUnique({
        where: { id: req.user?.id },
        select: {
          profileType: true
        }
      })
      if (user?.profileType === 'contact') {
        data.userBio.update.isOnBoardingComplete = true
        data.userBio.update.profileType = 'user'
      }

      await db.userAuth.update({
        where: { id: req.user?.id },
        data
      })

      return res.status(200).json({
        code: codes.OK,
        message: messages.VERIFIED_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Update Phone
  updatePhone = async (req: RequestUserAuth, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { phone } = params
    try {
      // Verify Input
      const validationError = validatePhone(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Verify User exists
      const user = await db.userAuth.findUnique({ where: { id: req.params.userId } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Check phone uniqueness
      const uniqueness = await db.userBio.findUnique({ where: { phone } })
      if (uniqueness !== null) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: `${messages.USER_ALREADY_EXIST} with phone "${phone}"`
        })
      }

      // Update User
      await db.userAuth.update({
        where: {
          id: req.params.userId
        },
        data: {
          userBio: {
            update: {
              phone
            }
          },
          isPhoneVerified: false
        }
      })

      // Send SMS Code and return
      await sendCodeToPhone(phone)
      return res.status(200).json({
        code: codes.OK,
        message: messages.CODE_SENT_PHONE_SUCCESS
      })
    } catch (error: any) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ code: error.status, message: error.message })
      }
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Pause Account
  pauseAccount = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify User exists
      const user = await db.userAuth.findUnique({ where: { id: req.params.userId } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Update User and return
      await db.userAuth.update({
        where: {
          id: req.params.userId
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Delete Account (trigger boolean)
  deleteAcount = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify User exists
      const user = await db.userAuth.findUnique({ where: { id: req.params.userId } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      // Update User and return
      await db.userAuth.update({
        where: {
          id: req.params.userId
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
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Delete User (database) UNUSED
  delete = async (req: RequestUserAuth, res: Response): Promise<Response> => {
    try {
      // Verify user exists
      const user = await db.userAuth.findUnique({ where: { id: req.params.userId } })
      if (!user) {
        return res.status(404).json({
          code: codes.NOT_FOUND,
          message: messages.USER_NOT_FOUND
        })
      }

      await db.userAuth.delete({ where: { id: req.params.userId } })

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

export default new AuthController()

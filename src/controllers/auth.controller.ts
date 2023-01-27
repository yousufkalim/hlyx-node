import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { codes } from '../config/codes'
import { messages } from '../config/messages'
import BaseController from './base.controller'
import { authControllerParams } from '../config/params'
import { config } from '../config/env.config.validations'
import { sendCodeToEmail } from '../utils/helper'
import { twilioClient } from '../utils/twilio'
import { validateForgotPassword, validateLogin, validateRegister, validateSendVerificationCode, validateVerifyCode } from '../utils/validations/auth.controller.validation'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

class AuthController extends BaseController {
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
      const userObject = {
        email,
        password: await bcrypt.hash(password, salt),
        userBio: { create: {} }
      }

      // Create User
      const createUser = await prisma.userAuth.create({ data: userObject })

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

  sendVerificationCode = async (req: Request, res: Response): Promise<Response> => {
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
      if (user === null) {
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

  verifyCodeEmail = async (req: Request, res: Response): Promise<Response> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, code } = params
    try {
      // Validate input
      const validationError = validateVerifyCode(params)
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

  forgotPassword = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, authControllerParams)
    const { email, code, password } = params
    try {
      // Verify Input
      const validationError = validateForgotPassword(params)
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
      const salt = await bcrypt.genSalt(10)
      await prisma.userAuth.update({
        where: { email },
        data: {
          password: await bcrypt.hash(password, salt)
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
}

export default new AuthController()

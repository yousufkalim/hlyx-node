import { Request, Response } from 'express'
import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'

import BaseController from './base.controller'
import { landingPageParams, contactUsParams } from '../config/params'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { validateLandingPageRegister, validateContactUs } from '../utils/validations/landingPage.controller.validation'
import { verifyEmailEmailer, contactUsEmailer } from '../utils/emailers'
import { createActiveCampaignContact } from '../utils/activeCampaign'
import { db } from '../utils/db'

class LandingPageController extends BaseController {
  register = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, landingPageParams)
    const { email, password, firstName, middleInitial, lastName, listIdentifier, status } = params
    try {
      // Validate input
      const validationError = validateLandingPageRegister(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      const salt = await bcrypt.genSalt(10)
      const data: any = {
        email,
        password: await bcrypt.hash(password, salt),
        listIdentifier
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

        await verifyEmailEmailer(email)
        return res.status(201).json({
          id: response.id,
          code: codes.CREATED,
          message: messages.LINK_SENT_SUCCESS
        })
      }

      // Register Completely New User
      const userBio = {
        firstName,
        middleInitial,
        lastName
      }

      data.userBio = { create: userBio }
      data.userPreference = { create: {} }
      data.userNotification = { create: {} }

      // Create User
      const createUser = await db.userAuth.create({ data })

      // Active Campagin
      await createActiveCampaignContact(email, firstName, lastName, listIdentifier, status)

      // Emailer
      await verifyEmailEmailer(email)

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

  // Contact Us
  contactUs = async (req: Request, res: Response): Promise<Response | undefined> => {
    const params = this.filterParams(req.body, contactUsParams)
    const { name, email, phone, subject, message } = params
    try {
      // Validate input
      const validationError = validateContactUs(params)
      if (validationError) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: validationError
        })
      }

      // Email and return
      await contactUsEmailer(name, email, phone, subject, message)

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

  test = async (req: Request, res: Response): Promise<Response | undefined> => {
    const { email, firstName, lastName, listIdentifer, status } = req.body
    try {
      await createActiveCampaignContact(email, firstName, lastName, listIdentifer, status)

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

  // Get list of files in apkFolder
  apkFileProvider = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      const fileName = req.params.fileName
      if (!fileName) {
        return res.status(400).json({
          code: codes.BAD_REQUEST,
          message: messages.FILE_NAME_REQUIRED
        })
      }

      const file = await fs.readFile(path.join(__dirname, '../assets/apkFiles/', fileName))
      return res.send(file)
    } catch (error: any) {
      console.error(error)
      return res
        .status(500)
        .json({ code: codes.INTERNAL_SERVER_ERROR, message: messages.SERVER_FAILURE })
    }
  }

  // Returns specified apk file
  apkFileList = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
      const fileNames = await fs.readdir(path.join(__dirname, '../assets/apkFiles/'))

      return res.status(200).json({
        fileNames,
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
  // Pricing (least prio atm)
}

export default new LandingPageController()

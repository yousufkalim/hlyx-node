import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import UserController from '../controllers/user.controller'
import { authenticate } from '../middleware/authentication'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const router = Router()

// Authentication Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.post('/auth/send-verification-code', AuthController.sendVerificationCode)
router.post('/auth/verify-code-email', AuthController.verifyCodeEmail)
router.post('/auth/forgot-password', AuthController.forgotPassword)

// User Routes (add auth after testing)
router.get('/user/me', authenticate, UserController.me)
router.post('/user/bioUpdate/:id', authenticate, UserController.updateBio)

router.get('/health-check', (req: Request, res: Response) => {
  return res.status(200).json({
    code: codes.OK,
    message: messages.HEALTH_CHECK
  })
})

/*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*/
// Route to reset database (TESTING PURPOSES ONLY)
router.post('/scrubDatabase', async (req: Request, res: Response) => {
  try {
    const one = prisma.link.deleteMany()
    const two = prisma.cardAchievements.deleteMany()
    const three = prisma.cardAdditionalLinks.deleteMany()
    const four = prisma.cardEmails.deleteMany()
    const six = prisma.cardPhones.deleteMany()
    const seven = prisma.cardPhotos.deleteMany()
    const eight = prisma.cardPortfolio.deleteMany()
    const nine = prisma.cardServices.deleteMany()
    const ten = prisma.cardSocialMedias.deleteMany()
    const eleven = prisma.cardWebsites.deleteMany()
    const twelve = prisma.card.deleteMany()
    const thirteen = prisma.userBio.deleteMany()
    const fourtenn = prisma.userPhoto.deleteMany()
    const fifteen = prisma.userAuth.deleteMany()
    console.log('yes')
    await prisma.$transaction([one, two, three, four, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourtenn, fifteen])
  } catch (error: any) {
    console.log(error)
  }
})

export default router

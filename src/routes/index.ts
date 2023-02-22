import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import UserController from '../controllers/user.controller'
import CardController from '../controllers/card.controller'
import LinkController from '../controllers/link.controller'
import { authenticate } from '../middleware/authentication'
import { userAuthorization, cardAuthorization, linkAuthorization } from '../middleware/authorization'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const router = Router()

// Authentication Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.post('/auth/send-code-email', AuthController.sendCodeEmail)
router.post('/auth/verify-code-email', AuthController.verifyCodeEmail)
router.post('/auth/forgot-password', AuthController.forgotPassword)
router.post('/auth/update-phone/:id', authenticate, userAuthorization, AuthController.updatePhone)
router.post('/auth/send-code-phone/', authenticate, AuthController.sendCodePhone)
router.post('/auth/verify-code-phone', authenticate, AuthController.verifyCodePhone)
router.post('/auth/delete-user/:id', authenticate, userAuthorization, AuthController.delete)

// User Routes
router.get('/user/me', authenticate, UserController.me)
router.post('/user/updateBio/:id', authenticate, userAuthorization, UserController.updateBio)
router.post('/user/updateAvatar/:id', authenticate, userAuthorization, UserController.updateProfileAvatar)
router.post('/user/addCard/:id', authenticate, userAuthorization, UserController.addCard)
router.post('/user/addProfilePhoto/:id', authenticate, userAuthorization, UserController.addProfilePhoto)
router.post('/user/deleteProfilePhoto/:id', authenticate, userAuthorization, UserController.deleteProfilePhoto)
router.get('/user/findProfilePhoto/:id', authenticate, userAuthorization, UserController.findProfilePhotos)
// Untested
router.get('/user/findAllLinks/:id', authenticate, userAuthorization, UserController.userAllLinks)

// Card Routes
router.get('/card/find/:urlPath', authenticate, CardController.find)
router.post('/card/update/:urlPath', authenticate, cardAuthorization, CardController.update)
router.post('/card/setCoverPhoto/:urlPath', authenticate, cardAuthorization, CardController.setActiveCoverPhoto)
router.post('/card/addCoverPhoto/:urlPath', authenticate, cardAuthorization, CardController.addCoverPhoto)
router.post('/card/deleteCoverPhoto/:urlPath', authenticate, cardAuthorization, CardController.deleteCoverPhoto)
router.get('/card/findCoverPhoto/:urlPath', authenticate, CardController.findCoverPhotos)
router.get('/card/findAllLinks/:urlPath', authenticate, CardController.cardAllLinks)
router.get('/card/delete/:urlPath', authenticate, cardAuthorization, CardController.delete)

// Link Routes
router.post('/link/create', authenticate, linkAuthorization, LinkController.create)
router.post('/link/delete', authenticate, linkAuthorization, LinkController.delete)
router.get('/link/find', authenticate, LinkController.find) // May need authorization
router.post('/link/update', authenticate, linkAuthorization, LinkController.update)

// Health Check
router.get('/health-check', (req: Request, res: Response) => {
  return res.status(200).json({
    code: codes.OK,
    message: messages.HEALTH_CHECK
  })
})

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
    const thirteen = prisma.userPhoto.deleteMany()
    const fourteen = prisma.userBio.deleteMany()
    const fifteen = prisma.userAuth.deleteMany()
    console.log('yes')
    await prisma.$transaction([one, two, three, four, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen])
  } catch (error: any) {
    console.log(error)
  }
})

export default router

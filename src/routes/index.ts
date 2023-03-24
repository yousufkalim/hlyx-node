import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import UserController from '../controllers/user.controller'
import CardController from '../controllers/card.controller'
import LinkController from '../controllers/link.controller'
import { authenticate } from '../middleware/authentication'
import { userAuthorization, cardAuthorization, linkAuthorization } from '../middleware/authorization'
import { emailPhoneVerified } from '../middleware/email-phone-verification'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { config } from '../config/env.config.validations'

const router = Router()

// Authentication Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.post('/auth/send-code-email', AuthController.sendCodeEmail)
router.post('/auth/verify-code-email', authenticate, AuthController.verifyCodeEmail)
router.post('/auth/verify-code-password-reset', AuthController.verifyCodePassword)
router.put('/auth/forgot-password', AuthController.forgotPassword)
router.put('/auth/update-phone/:id', authenticate, userAuthorization, AuthController.updatePhone)
router.post('/auth/send-code-phone', authenticate, AuthController.sendCodePhone)
router.post('/auth/verify-code-phone', authenticate, AuthController.verifyCodePhone)
router.put('/auth/pause-account/:id', authenticate, userAuthorization, AuthController.pauseAccount)
router.delete('/auth/delete-account/:id', authenticate, userAuthorization, AuthController.deleteAcount)

// User Routes
router.get('/user/find/me', authenticate, emailPhoneVerified, UserController.me)
router.put('/user/update/bio/:id', authenticate, emailPhoneVerified, userAuthorization, UserController.updateBio)
router.put('/user/update/avatar/:id', authenticate, emailPhoneVerified, userAuthorization, UserController.updateProfileAvatar)
router.post('/user/add/card/:id', authenticate, userAuthorization, emailPhoneVerified, UserController.addCard)
router.post('/user/add/profile-photo/:id', authenticate, userAuthorization, emailPhoneVerified, UserController.addProfilePhoto)
router.get('/user/find/profile-photos/:id', authenticate, userAuthorization, emailPhoneVerified, UserController.findProfilePhotos)

// Card Routes
router.get('/card/find/base-info/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.getBaseInfo)
router.get('/card/find/contact-page/:cardId', CardController.getContact)
router.get('/card/find/about-page/:cardId', CardController.getAbout)
router.get('/card/find/services-page/:cardId', CardController.getServices)
router.get('/card/find/portfolio-page/:cardId', CardController.getPortfolio)

router.post('/card/add/cover-photo/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.addCoverPhoto)
router.put('/card/update/cover-photo/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updateCoverPhoto)
router.get('/card/find/cover-photos/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.findCoverPhotos)

router.post('/card/add/company-icon/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.addCompanyIcon)
router.put('/card/update/company-icon/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updateCompanyIcon)
router.get('/card/find/company-icon/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.findCompanyIcons)

router.put('/card/update/full-name/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updateFullName)
router.put('/card/update/contact-page/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updateContactPage)
router.put('/card/update/about-page/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updateAboutPage)
router.put('/card/update/services/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updateServicesPage)
router.post('/card/add/portfolio-image/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.addPortfolioImage)
router.put('/card/update/portfolio/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updatePortfolioPage)

router.put('/card/update/public-visibility/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updatePublicVisibility)
router.put('/card/update/template/:cardId', authenticate, cardAuthorization, emailPhoneVerified, CardController.updateTemplateId)

// (Currently Unused)
router.delete('/card/delete/:cardId', authenticate, cardAuthorization, CardController.delete)
router.get('/user/find/all-links/:id', authenticate, userAuthorization, UserController.userAllLinks)
router.get('/card/find/all-links/:cardId', authenticate, CardController.cardAllLinks)

// Link Routes (Currently Unused)
router.post('/link/create', authenticate, linkAuthorization, LinkController.create)
router.post('/link/delete', authenticate, linkAuthorization, LinkController.delete)
router.get('/link/find', authenticate, LinkController.find) // May need authorization
router.post('/link/update', authenticate, linkAuthorization, LinkController.update)

// Health Check
router.get('/health-check', (req: Request, res: Response) => {
  return res.status(200).json({
    code: codes.OK,
    message: `${messages.HEALTH_CHECK} on ${config.get('env')}`
  })
})

export default router

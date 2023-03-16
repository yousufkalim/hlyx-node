import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import UserController from '../controllers/user.controller'
import CardController from '../controllers/card.controller'
import LinkController from '../controllers/link.controller'
import { authenticate } from '../middleware/authentication'
import { userAuthorization, cardAuthorization, linkAuthorization } from '../middleware/authorization'
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
router.get('/user/find/me', authenticate, UserController.me)
router.put('/user/update/bio/:id', authenticate, userAuthorization, UserController.updateBio)
router.post('/user/add/card/:id', authenticate, userAuthorization, UserController.addCard)
router.post('/user/add/profile-photo/:id', authenticate, userAuthorization, UserController.addProfilePhoto)
router.delete('/user/delete/profile-photo/:id', authenticate, userAuthorization, UserController.deleteProfilePhoto)
router.put('/user/update/profile-photos/:id', authenticate, userAuthorization, UserController.deleteExistingAddNewProfilePhotos)
router.put('/user/update/avatar/:id', authenticate, userAuthorization, UserController.updateProfileAvatar)
router.get('/user/find/profile-photos/:id', authenticate, userAuthorization, UserController.findProfilePhotos)

// Card Routes
router.get('/card/find/:cardId', authenticate, CardController.find)
router.put('/card/update/full-name/:cardId', authenticate, cardAuthorization, CardController.updateFullName)
router.put('/card/update/contact-page/:cardId', authenticate, cardAuthorization, CardController.updateContactPage)
router.put('/card/update/about-page/:cardId', authenticate, cardAuthorization, CardController.updateAboutPage)
router.put('/card/update/services/:cardId', authenticate, cardAuthorization, CardController.updateServicesPage)
router.put('/card/update/portfolio/:cardId', authenticate, cardAuthorization, CardController.updatePortfolioPage)
router.post('/card/add/cover-photo/:cardId', authenticate, cardAuthorization, CardController.addCoverPhoto)
router.delete('/card/delete/cover-photo/:cardId', authenticate, cardAuthorization, CardController.deleteCoverPhoto)
router.put('/card/update/cover-photos/:cardId', authenticate, cardAuthorization, CardController.deleteExistingAddNewCoverPhotos)
router.put('/card/update/active-cover-photo/:cardId', authenticate, cardAuthorization, CardController.updateCoverPhoto)
router.get('/card/find/cover-photos/:cardId', authenticate, CardController.findCoverPhotos)
router.put('/card/update/public-visibility/:cardId', authenticate, cardAuthorization, CardController.updatePublicVisibility)
router.put('/card/update/company-icon/:cardId', authenticate, cardAuthorization, CardController.updateCompanyIcon)
router.put('/card/update/template/:cardId', authenticate, cardAuthorization, CardController.updateTemplateId)
router.delete('/card/delete/:cardId', authenticate, cardAuthorization, CardController.delete)

// (NEEDS TESTING)
router.get('/user/find/all-links/:id', authenticate, userAuthorization, UserController.userAllLinks)
router.get('/card/find/all-links/:cardId', authenticate, CardController.cardAllLinks)

// Link Routes (NEEDS TESTING)
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

router.get('/test', AuthController.getNewAccessToken)

export default router

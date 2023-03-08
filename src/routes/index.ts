import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import UserController from '../controllers/user.controller'
import CardController from '../controllers/card.controller'
import LinkController from '../controllers/link.controller'
import { authenticate } from '../middleware/authentication'
import { userAuthorization, cardAuthorization, linkAuthorization } from '../middleware/authorization'
import { codes } from '../config/codes'
import { messages } from '../config/messages'

const router = Router()

// Authentication Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.post('/auth/send-code-email', AuthController.sendCodeEmail)
router.post('/auth/verify-code-email', authenticate, AuthController.verifyCodeEmail)
router.post('/auth/verify-code-password-reset', AuthController.verifyCodePassword)
router.post('/auth/forgot-password', AuthController.forgotPassword)
router.post('/auth/update-phone/:id', authenticate, userAuthorization, AuthController.updatePhone)
router.post('/auth/send-code-phone/', authenticate, AuthController.sendCodePhone)
router.post('/auth/verify-code-phone', authenticate, AuthController.verifyCodePhone)
router.post('/auth/pause-account/:id', authenticate, userAuthorization, AuthController.pauseAccount)
router.post('/auth/delete-account/:id', authenticate, userAuthorization, AuthController.deleteAcount)

// User Routes
router.get('/user/find/me', authenticate, UserController.me)
router.post('/user/update/bio/:id', authenticate, userAuthorization, UserController.updateBio)
router.post('/user/update/avatar/:id', authenticate, userAuthorization, UserController.updateProfileAvatar)
router.post('/user/add/card/:id', authenticate, userAuthorization, UserController.addCard)
router.post('/user/add/profile-photo/:id', authenticate, userAuthorization, UserController.addProfilePhoto)
router.post('/user/delete/profile-photo/:id', authenticate, userAuthorization, UserController.deleteProfilePhoto)
router.post('/user/update/profile-photos/:id', authenticate, userAuthorization, UserController.deleteExistingAddNewProfilePhotos)
router.get('/user/find/profile-photos/:id', authenticate, userAuthorization, UserController.findProfilePhotos)
// (NEEDS TESTING)
router.get('/user/find/all-links/:id', authenticate, userAuthorization, UserController.userAllLinks)

// Card Routes
router.get('/card/find/:urlPath', authenticate, CardController.find)
router.post('/card/update/full-name/:urlPath', authenticate, cardAuthorization, CardController.updateFullName)
router.post('/card/update/contact-page/:urlPath', authenticate, cardAuthorization, CardController.updateContactPage)
router.post('/card/update/about-page/:urlPath', authenticate, cardAuthorization, CardController.updateAboutPage)
router.post('/card/update/services/:urlPath', authenticate, cardAuthorization, CardController.updateServicesPage)
router.post('/card/update/portfolio/:urlPath', authenticate, cardAuthorization, CardController.updatePortfolioPage)
router.post('/card/update/active-cover-photo/:urlPath', authenticate, cardAuthorization, CardController.updateCoverPhoto)
router.post('/card/add/cover-photo/:urlPath', authenticate, cardAuthorization, CardController.addCoverPhoto)
router.post('/card/delete/cover-photo/:urlPath', authenticate, cardAuthorization, CardController.deleteCoverPhoto)
router.post('/card/update/cover-photos/:urlPath', authenticate, cardAuthorization, CardController.deleteExistingAddNewCoverPhotos)
router.get('/card/find/cover-photos/:urlPath', authenticate, CardController.findCoverPhotos)
router.post('/card/update/public-visibility/:urlPath', authenticate, cardAuthorization, CardController.updatePublicVisibility)
// (NEEDS TESTING)
router.get('/card/find/all-links/:urlPath', authenticate, CardController.cardAllLinks)
router.post('/card/delete/:urlPath', authenticate, cardAuthorization, CardController.delete)

// Link Routes (NEEDS TESTING)
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

router.get('/test', AuthController.getNewAccessToken)

export default router

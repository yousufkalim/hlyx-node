import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import UserController from '../controllers/user.controller'
import CardController from '../controllers/card.controller'
import LinkController from '../controllers/link.controller'
import ContactRequstController from '../controllers/contactRequest.controller'
import NotificationController from '../controllers/notification.controller'
import { authenticate } from '../middleware/authentication'
import {
  userAuthorization,
  cardAuthorization,
  linkAuthorization,
  noteAuthorization,
  notificationAuthorization,
  sharedContactAuthorization,
  groupAdminAuthorization,
  groupAuthorization
} from '../middleware/authorization'
import { codes } from '../config/codes'
import { messages } from '../config/messages'
import { config } from '../config/env.config.validations'
import GroupController from '../controllers/group.controller'
import LandingPageController from '../controllers/landingPage.controller'

const router = Router()

// Authentication Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.post('/auth/2fa/login', AuthController.loginWith2FA)
router.get('/auth/navigation', authenticate, AuthController.navigationHelper)
router.post('/auth/send-verify-email', AuthController.resendVerificationEmail)
router.post('/auth/send-password-reset', AuthController.passwordResetEmail)
router.get('/auth/verify-email-url', AuthController.verifyCodeURL)
router.post('/auth/verify-code-password-reset', AuthController.verifyCodePassword)
router.put('/auth/forgot-password', AuthController.forgotPassword)
router.put(
  '/auth/update-phone/:userId',
  authenticate,
  userAuthorization,
  AuthController.updatePhone
)
router.put(
  '/auth/update-email/:userId',
  authenticate,
  userAuthorization,
  AuthController.updateEmail
)
router.post(
  '/auth/send-code-phone/:userId',
  authenticate,
  userAuthorization,
  AuthController.sendCodePhone
)
router.post(
  '/auth/verify-code-phone/:userId',
  authenticate,
  userAuthorization,
  AuthController.verifyCodePhone
)
router.put(
  '/auth/pause-account/:userId',
  authenticate,
  userAuthorization,
  AuthController.pauseAccount
)
router.delete(
  '/auth/delete-account/:userId',
  authenticate,
  userAuthorization,
  AuthController.deleteAcount
)

// User Routes
router.get('/user/find/me', authenticate, UserController.me)
router.get('/user/stats/:userId', authenticate, UserController.userStats)
router.get('/user/contact-details', authenticate, UserController.userContactDetails)
router.get('/user/find-profile/:userName', authenticate, UserController.getUserByUserName)
router.put('/user/update/bio/:userId', authenticate, userAuthorization, UserController.updateBio)
router.get(
  '/user/favorite/social-media/:userId',
  authenticate,
  userAuthorization,
  UserController.getFavoriteSocialMedias
)
router.post(
  '/user/favorite/social-media/:userId',
  authenticate,
  userAuthorization,
  UserController.addSocialMediaFavorite
)
router.post(
  '/user/add/minimal-card/:userId',
  authenticate,
  userAuthorization,
  UserController.addMinimalCard
)

router.post(
  '/user/add/premium-card/:userId',
  authenticate,
  userAuthorization,
  UserController.addPremiumCard
)

router.post(
  '/user/add/profile-photo/:userId',
  authenticate,
  userAuthorization,
  UserController.addProfilePhoto
)
router.delete(
  '/user/delete/profile-photo/:userId',
  authenticate,
  userAuthorization,
  UserController.deleteProfilePhoto
)
router.put(
  '/user/update/avatar/:userId',
  authenticate,
  userAuthorization,
  UserController.updateProfileAvatar
)
router.get(
  '/user/find/profile-photos/:userId',
  authenticate,
  userAuthorization,
  UserController.findProfilePhotos
)

// User Setting Routes
router.put(
  '/user/update/settings/:userId',
  authenticate,
  userAuthorization,
  UserController.updateSettings
)
router.put(
  '/user/update/notification-setting/:userId',
  authenticate,
  userAuthorization,
  UserController.updateNotificationSetting
)

// Card Routes
router.get('/card/find/base-info/:cardId', CardController.getBaseInfo)
router.get('/card/find/card-info/:cardId', CardController.getCardInfo)
router.get('/card/find/contact-page/:cardId', CardController.getContact)
router.get('/card/find/about-page/:cardId', CardController.getAbout)
router.get('/card/find/services-page/:cardId', CardController.getServices)
router.get('/card/find/portfolio-page/:cardId', CardController.getPortfolio)

// Card Cover Photo
router.post(
  '/card/add/cover-photo/:cardId',
  authenticate,
  cardAuthorization,
  CardController.addCoverPhoto
)
router.put(
  '/card/update/cover-photo/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateCoverPhoto
)
router.get(
  '/card/find/cover-photos/:cardId',
  authenticate,
  cardAuthorization,
  CardController.findCoverPhotos
)
router.delete(
  '/card/delete/cover-photo/:cardId',
  authenticate,
  cardAuthorization,
  CardController.deleteCoverPhoto
)

// Card Company Icon
router.post(
  '/card/add/company-icon/:cardId',
  authenticate,
  cardAuthorization,
  CardController.addCompanyIcon
)
router.put(
  '/card/update/company-icon/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateCompanyIcon
)
router.get(
  '/card/find/company-icon/:cardId',
  authenticate,
  cardAuthorization,
  CardController.findCompanyIcons
)
router.delete(
  '/card/delete/company-icon/:cardId',
  authenticate,
  cardAuthorization,
  CardController.deleteCompanyIcon
)

router.post(
  '/card/add/premium-card-service-photo/:userId',
  authenticate,
  userAuthorization,
  CardController.addCardServiceImage
)

// Card Update Info Routes
router.put(
  '/card/update/minimal-card/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateMinimalCard
)

router.put(
  '/card/update/premium-card/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updatePremiumCard
)

router.put(
  '/card/update/card-name/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateCardName
)
router.put(
  '/card/update/full-name/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateFullName
)
router.put(
  '/card/update/contact-page/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateContactPage
)
router.put(
  '/card/update/about-page/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateAboutPage
)
router.put(
  '/card/update/services/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateServicesPage
)
router.post(
  '/card/add/portfolio-image/:userId',
  authenticate,
  userAuthorization,
  CardController.addPortfolioImage
)
router.put(
  '/card/update/portfolio/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updatePortfolioPage
)

router.put(
  '/card/update/template/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateTemplateId
)
router.put('/card/update/slug/:cardId', authenticate, cardAuthorization, CardController.updateSlug)
router.delete('/card/delete/:cardId', authenticate, cardAuthorization, CardController.delete)

// Card Shared Routes
router.post(
  '/card/share/profile-card/:cardId',
  authenticate,
  // cardAuthorization,
  CardController.sharedProfileCard
)

// Card Update Settings Routes
router.put(
  '/card/update/public-visibility/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updatePublicVisibility
)
router.put(
  '/card/update/card-activation/:cardId',
  authenticate,
  cardAuthorization,
  CardController.updateCardActivation
)

// Link Routes
router.post('/link/create', authenticate, LinkController.create)
router.put('/link/update/:linkId', authenticate, linkAuthorization, LinkController.update)
router.put('/link/update-details', authenticate, linkAuthorization, LinkController.updateDetails)
router.put(
  '/link/permanent-block/:linkId',
  authenticate,
  linkAuthorization,
  LinkController.permanentBlock
)
router.put(
  '/link/update/unblock/:userId',
  authenticate,
  userAuthorization,
  LinkController.unblockLink
)
router.put(
  '/link/update/unmute/:linkId',
  authenticate,
  linkAuthorization,
  LinkController.unmuteLink
)
router.delete('/link/delete/:linkId', authenticate, linkAuthorization, LinkController.deleteLink)

// Link Get Routes
router.get('/link/find/card/accepted/:cardId', authenticate, LinkController.cardAllLinks)
router.get(
  '/link/find/user/connections/:userId',
  authenticate,
  userAuthorization,
  LinkController.userAllConnections
)
router.get(
  '/link/find/cards/favourites/:userId',
  authenticate,
  userAuthorization,
  LinkController.userFavouriteLinks
)
router.get(
  '/link/find/user/accepted/:userId',
  authenticate,
  userAuthorization,
  LinkController.userAllLinks
)
router.get(
  '/link/find/user/blocked/:userId',
  authenticate,
  userAuthorization,
  LinkController.userAllBlocks
)
router.get(
  '/link/find/user/incoming-requests/:userId',
  authenticate,
  userAuthorization,
  LinkController.userAllIncomingLinkRequests
)
router.get(
  '/link/find/user/outgoing-requests/:userId',
  authenticate,
  userAuthorization,
  LinkController.userAllOutgoingLinkRequests
)

// Link Notes
router.post('/link/create/note/:linkId', authenticate, linkAuthorization, LinkController.createNote)
router.get('/link/find/notes/:linkId', authenticate, linkAuthorization, LinkController.findAllNotes)
router.put('/link/update/note/:noteId', authenticate, noteAuthorization, LinkController.updateNote)
router.delete(
  '/link/delete/note/:noteId',
  authenticate,
  noteAuthorization,
  LinkController.deleteNote
)

// Link Images
router.post(
  '/link/add/link-photo/:linkId',
  authenticate,
  linkAuthorization,
  LinkController.addLinkPhoto
)
router.get(
  '/link/find/link-photo/:linkId',
  authenticate,
  linkAuthorization,
  LinkController.findLinkPhotos
)
router.delete(
  '/link/delete/link-photo/:linkId',
  authenticate,
  linkAuthorization,
  LinkController.deleteLinkPhoto
)

// Link Favorites
router.put(
  '/link/add/favorites/:linkId',
  authenticate,
  linkAuthorization,
  LinkController.addToFavorites
)
router.put(
  '/link/remove/favorites/:linkId',
  authenticate,
  linkAuthorization,
  LinkController.removeFavorites
)

// Notificaiton Routes
router.get(
  '/notification/find/active/:userId',
  authenticate,
  userAuthorization,
  NotificationController.getActiveNotification
)
router.get(
  '/notification/find/archived/:userId',
  authenticate,
  userAuthorization,
  NotificationController.getArchivedNotification
)
router.put(
  '/notification/update/archive/:notificationId',
  authenticate,
  notificationAuthorization,
  NotificationController.archiveNotification
)
router.put(
  '/notification/update/read/:notificationId',
  authenticate,
  notificationAuthorization,
  NotificationController.readNotification
)
router.delete(
  '/notification/delete/:notificationId',
  authenticate,
  notificationAuthorization,
  NotificationController.deleteNotification
)

// Shared Contact Routes
router.post('/contact/create', ContactRequstController.create)
router.get(
  '/contact/find/saved/:userId',
  authenticate,
  userAuthorization,
  ContactRequstController.getSaved
)
router.get(
  '/contact/find/requested/:userId',
  authenticate,
  userAuthorization,
  ContactRequstController.getRequested
)
router.get(
  '/contact/find/archived/:userId',
  authenticate,
  userAuthorization,
  ContactRequstController.getArchived
)
router.put(
  '/contact/update/details',
  authenticate,
  sharedContactAuthorization,
  LinkController.updateDetails
)
router.put(
  '/contact/update/status/:contactId',
  authenticate,
  sharedContactAuthorization,
  ContactRequstController.updateStatus
)
router.put(
  '/contact/update/note/:contactId',
  authenticate,
  sharedContactAuthorization,
  ContactRequstController.updateNote
)
router.delete(
  '/contact/delete/:contactId',
  authenticate,
  sharedContactAuthorization,
  ContactRequstController.deleteContact
)

// Group Routes
router.get(
  '/group/all-groups/:userId',
  authenticate,
  userAuthorization,
  GroupController.getAllGroups
)
router.get(
  '/group/group-details/:groupId',
  authenticate,
  groupAuthorization,
  GroupController.getGroupDetails
)
router.post('/group/create/:userId', authenticate, userAuthorization, GroupController.createGroup)
router.put(
  '/group/update/:groupId',
  authenticate,
  groupAdminAuthorization,
  GroupController.updateGroup
)
router.delete(
  '/group/delete/:groupId',
  authenticate,
  groupAdminAuthorization,
  GroupController.deleteGroup
)

// Group Message Routes
router.post(
  '/group/send-message/:groupId',
  authenticate,
  groupAuthorization,
  GroupController.sendMessageInGroup
)

/* Landing Page Routes */
router.post(
  '/landingPage/register',
  LandingPageController.register
)
router.post(
  '/landingPage/login',
  LandingPageController.login
)
router.put(
  '/landingPage/verify-email',
  LandingPageController.verifyEmail
)
router.get(
  '/landingPage/me',
  authenticate,
  LandingPageController.me
)
router.post(
  '/landingPage/contact-us',
  LandingPageController.contactUs
)
router.get(
  '/landingPage/fileProvider/:dir/:fileName',
  LandingPageController.fileProvider
)
router.get(
  '/landingPage/investorFileList',
  LandingPageController.investorFileList
)
router.get(
  '/landingPage/apkFileList',
  LandingPageController.apkFileList
)

// Health Check
router.get('/health-check', (req: Request, res: Response) => {
  return res.status(200).json({
    code: codes.OK,
    message: `${messages.HEALTH_CHECK} on ${config.get('env')}`
  })
})

export default router

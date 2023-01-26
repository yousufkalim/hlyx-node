import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import { codes } from '../config/codes'
import { messages } from '../config/messages'

const router = Router()

// Authentication Routes
router.post('/auth/register', AuthController.register)
router.post('/auth/login', AuthController.login)
router.post('/auth/send-verification-code', AuthController.sendVerificationCode)
router.post('/auth/verify-code', AuthController.verifyCodeEmail)
router.post('/auth/forgot-password', AuthController.forgotPassword)

router.get('/health-check', (req: Request, res: Response) => {
  return res.status(200).json({
    code: codes.OK,
    message: messages.HEALTH_CHECK
  })
})

export default router

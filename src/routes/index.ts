import { Router, Request, Response } from 'express'

import AuthController from '../controllers/auth.controller'
import { codes } from '../config/codes'
import { messages } from '../config/messages'

const router = Router()

// Authentication Routes
router.post('/auth/login', AuthController.login)

router.get('/health-check', (req: Request, res: Response) => {
  return res.status(200).json({
    code: codes.OK,
    message: messages.HEALTH_CHECK
  })
})

export default router

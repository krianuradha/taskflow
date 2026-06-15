import { Router } from 'express'
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  refreshToken,
  forgotPassword,
  resetForgotPassword,
  changePassword,
  getCurrentUser,
  resendEmailVerification,
  updateProfile,
  updateAvatar,
} from '../controllers/auth.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validation.middleware.js'
import {
  validateRegistration,
  userValidatorLogin,
  userForgotPasswordValidator,
  userChangePasswordValidator,
  userResetPasswordValidator,
} from '../validators/index.js'

const router = Router()

// ── Public Routes ─────────────────────────────────────────────────────────────
router.route('/register').post(validate(validateRegistration()), registerUser)
router.route('/login').post(validate(userValidatorLogin()), loginUser)
router.route('/verify-email/:emailVerificationToken').get(verifyEmail)
router.route('/refresh-token').post(refreshToken)
router.route('/forgot-password').post(validate(userForgotPasswordValidator()), forgotPassword)
router.route('/reset-password/:resetToken').post(validate(userResetPasswordValidator()), resetForgotPassword)

import multer from 'multer'

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 4 * 1024 * 1024 } 
})

// ── Protected Routes ──────────────────────────────────────────────────────────
router.route('/logout').post(authMiddleware, logoutUser)
router.route('/change-password').post(authMiddleware, validate(userChangePasswordValidator()), changePassword)
router.route('/current-user').get(authMiddleware, getCurrentUser)
router.route('/resend-verification-email').post(authMiddleware, resendEmailVerification)
router.route('/update-profile').post(authMiddleware, updateProfile)
router.route('/avatar').post(authMiddleware, upload.single('avatar'), updateAvatar)

export default router

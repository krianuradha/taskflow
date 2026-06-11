import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import { User } from '../models/user.model.js'
import { ApiError } from '../utils/api-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { asyncHandler } from '../utils/async-handler.js'
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/mail.js'

// ── Generate Tokens ───────────────────────────────────────────────────────────
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, 'Failed to generate tokens')
  }
}

// ── Register ──────────────────────────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body

  const existedUser = await User.findOne({ $or: [{ username }, { email }] })
  if (existedUser) {
    throw new ApiError(409, 'Username or email already exists')
  }

  const newUser = await User.create({
    username,
    email,
    fullname,
    password,
    isEmailVerified: false,
  })

  const { unHashedToken, hashedToken, tokenExpiry } =
    newUser.generateTemporaryToken()

  newUser.emailVerificationToken = hashedToken
  newUser.emailVerificationTokenExpiration = tokenExpiry
  await newUser.save({ validateBeforeSave: false })

  // Fire-and-forget — do NOT await; never block the response on email
  const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
  sendVerificationEmail(newUser, unHashedToken, baseUrl).catch(console.error)

  const createdUser = await User.findById(newUser._id).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiration'
  )

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User registered successfully. Please check your email to verify your account.'))
})

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body

  if (!email && !username) {
    throw new ApiError(400, 'Email or username is required')
  }

  const user = await User.findOne({ $or: [{ email }, { username }] })

  if (!user) {
    throw new ApiError(401, 'Invalid credentials')
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in')
  }

  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid credentials')
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiration'
  )

  const cookieOptions = { httpOnly: true, secure: true, sameSite: 'strict' }

  return res
    .status(200)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken, user: loggedInUser }, 'Login successful'))
})

// ── Logout ────────────────────────────────────────────────────────────────────
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: '' } })

  const cookieOptions = { httpOnly: true, secure: true, sameSite: 'strict' }

  return res
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'))
})

// ── Get Current User ──────────────────────────────────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, 'User fetched successfully'))
})

// ── Verify Email ──────────────────────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { emailVerificationToken } = req.params

  const hashedToken = crypto
    .createHash('sha256')
    .update(emailVerificationToken)
    .digest('hex')

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiration: { $gt: Date.now() },
  })

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token')
  }

  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationTokenExpiration = undefined
  await user.save()

  return res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'))
})

// ── Resend Email Verification ─────────────────────────────────────────────────
const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified')
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken()

  user.emailVerificationToken = hashedToken
  user.emailVerificationTokenExpiration = tokenExpiry
  await user.save({ validateBeforeSave: false })

  // Fire-and-forget
  const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
  sendVerificationEmail(user, unHashedToken, baseUrl).catch(console.error)

  return res.status(200).json(new ApiResponse(200, null, 'Verification email sent successfully'))
})

// ── Refresh Token ─────────────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.body?.refreshToken ||
    req.headers['x-refresh-token']

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token missing')
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET)

    const user = await User.findById(decoded._id)

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, 'Invalid refresh token')
    }

    const newAccessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()
    user.refreshToken = newRefreshToken
    await user.save({ validateBeforeSave: false })

    const cookieOptions = { httpOnly: true, secure: true, sameSite: 'strict' }

    return res
      .status(200)
      .cookie('accessToken', newAccessToken, cookieOptions)
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed'))
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }
})

// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  // Always return 200 to prevent email enumeration attacks
  if (!user) {
    return res.status(200).json(
      new ApiResponse(200, null, 'If that email exists, a reset link has been sent')
    )
  }

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken()

  user.forgetpasswordToken = hashedToken
  user.forgetpasswordTokenExpiration = tokenExpiry
  await user.save({ validateBeforeSave: false })

  // Fire-and-forget
  const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`
  sendPasswordResetEmail(user, unHashedToken, baseUrl).catch(console.error)

  return res.status(200).json(
    new ApiResponse(200, null, 'If that email exists, a reset link has been sent')
  )
})

// ── Reset Password ────────────────────────────────────────────────────────────
const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params
  const { newPassword } = req.body

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  const user = await User.findOne({
    forgetpasswordToken: hashedToken,
    forgetpasswordTokenExpiration: { $gt: Date.now() },
  })

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token')
  }

  user.password = newPassword
  user.forgetpasswordToken = undefined
  user.forgetpasswordTokenExpiration = undefined
  await user.save()

  return res.status(200).json(new ApiResponse(200, null, 'Password reset successful'))
})

// ── Change Password ───────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id)
  const isMatch = await user.comparePassword(currentPassword)

  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect')
  }

  user.password = newPassword
  await user.save()

  return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshToken,
  forgotPassword,
  resetForgotPassword,
  changePassword,
}

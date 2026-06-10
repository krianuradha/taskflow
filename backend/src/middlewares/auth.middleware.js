import jwt from 'jsonwebtoken'
import { ProjectMember } from '../models/projectMember.model.js'
import { User } from '../models/user.model.js'
import { ApiError } from '../utils/api-error.js'
import { asyncHandler } from '../utils/async-handler.js'
import mongoose from 'mongoose'

export const authMiddleware = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new ApiError(401, 'Access token missing')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded?._id).select(
      '-password -refreshToken'
    )

    if (!user) {
      throw new ApiError(401, 'Invalid token')
    }

    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, 'Unauthorized')
  }
})

export const validateProjectAccess = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { projectId } = req.params

    if (!projectId) {
      throw new ApiError(400, 'Project ID is required')
    }

    const projectMember = await ProjectMember.findOne({
      user: new mongoose.Types.ObjectId(req.user._id),
      project: new mongoose.Types.ObjectId(projectId),
    })

    if (!projectMember) {
      throw new ApiError(403, 'Access denied')
    }

    const givenRole = projectMember.role
    req.user.role = givenRole

    if (roles.length && !roles.includes(givenRole)) {
      throw new ApiError(403, 'Insufficient permissions')
    }

    next()
  })
}

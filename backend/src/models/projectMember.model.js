import mongoose from 'mongoose'
import { AvailableUserRole, UserRoleEnum } from '../utils/constants.js'

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      default: UserRoleEnum.MEMBER,
    },
  },
  {
    timestamps: true,
  }
)

// Prevents duplicate membership
projectMemberSchema.index({ user: 1, project: 1 }, { unique: true })

// Safe export pattern
export const ProjectMember =
  mongoose.models.ProjectMember ||
  mongoose.model('ProjectMember', projectMemberSchema)

import mongoose from 'mongoose'
import { User } from '../models/user.model.js'
import { Project } from '../models/project.model.js'
import { ProjectMember } from '../models/projectMember.model.js'
import { Task } from '../models/task.model.js'
import { ApiError } from '../utils/api-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { asyncHandler } from '../utils/async-handler.js'
import { AvailableUserRole, UserRoleEnum } from '../utils/constants.js'
import { sendProjectInviteEmail } from '../utils/mail.js'

// ── Get Projects (for logged-in user) ────────────────────────────────────────
const getProject = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projects',
        pipeline: [
          {
            $lookup: {
              from: 'projectmembers',
              localField: '_id',
              foreignField: 'project',
              as: 'members',
            },
          },
          {
            $lookup: {
              from: 'tasks',
              let: { projectId: '$_id' },
              pipeline: [
                { $match: { $expr: { $eq: ['$project', '$$projectId'] } } },
                {
                  $group: {
                    _id: null,
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                      $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
                    },
                  },
                },
              ],
              as: 'taskStats',
            },
          },
          {
            $addFields: {
              memberCount: { $size: '$members' },
              taskCount: {
                $ifNull: [{ $arrayElemAt: ['$taskStats.totalTasks', 0] }, 0],
              },
              completedTasks: {
                $ifNull: [{ $arrayElemAt: ['$taskStats.completedTasks', 0] }, 0],
              },
            },
          },
        ],
      },
    },
    { $unwind: '$projects' },
    {
      $project: {
        _id: 0,
        id: '$projects._id',
        role: 1,
        name: '$projects.name',
        description: '$projects.description',
        memberCount: '$projects.memberCount',
        taskCount: '$projects.taskCount',
        completedTasks: '$projects.completedTasks',
      },
    },
  ])

  return res.json(new ApiResponse(200, projects, 'Projects retrieved successfully'))
})

// ── Create Project ────────────────────────────────────────────────────────────
const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  })

  // Auto-add creator as ADMIN
  await ProjectMember.create({
    project: project._id,
    user: req.user._id,
    role: UserRoleEnum.ADMIN,
  })

  return res.status(201).json(
    new ApiResponse(201, project, 'Project created successfully')
  )
})

// ── Get Project By ID ─────────────────────────────────────────────────────────
const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const project = await Project.findById(projectId).lean()

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const members = await ProjectMember.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $project: { _id: 1, fullname: 1, email: 1 } }],
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        id: '$user._id',
        name: '$user.fullname',
        email: '$user.email',
        role: 1,
        joinedAt: '$createdAt',
      },
    },
  ])

  const taskCount = await Task.countDocuments({ project: projectId })
  const completedTasks = await Task.countDocuments({ project: projectId, status: 'done' })

  return res.json(
    new ApiResponse(200, {
      id: project._id,
      name: project.name,
      description: project.description,
      members,
      taskCount,
      completedTasks,
    }, 'Project retrieved successfully')
  )
})

// ── Update Project ────────────────────────────────────────────────────────────
const UpdateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  const project = await Project.findByIdAndUpdate(
    req.params.projectId,
    { name, description },
    { new: true }
  )

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  return res.json(new ApiResponse(200, project, 'Project updated successfully'))
})

// ── Delete Project ────────────────────────────────────────────────────────────
const DeleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.projectId)

  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  // Cascade delete memberships
  await ProjectMember.deleteMany({ project: req.params.projectId })

  return res.json(new ApiResponse(200, null, 'Project deleted successfully'))
})

// ── Add Member (upsert) ───────────────────────────────────────────────────────
const addMemberToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body
  const { projectId } = req.params

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    { project: projectId, user: user._id },
    { $set: { role } },
    { new: true, upsert: true }
  )

  // Fire-and-forget invite email
  sendProjectInviteEmail(user, project, req.user).catch(console.error)

  return res.json({
    success: true,
    message: 'Member added/updated successfully',
    data: projectMember,
  })
})

// ── Get Project Members ───────────────────────────────────────────────────────
const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const members = await ProjectMember.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ])

  return res.json({
    success: true,
    message: 'Project members retrieved successfully',
    data: members,
  })
})

// ── Update Role ───────────────────────────────────────────────────────────────
const UpdateProjectRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params
  const { newRole } = req.body

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, 'Invalid role provided')
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    { project: projectId, user: userId },
    { $set: { role: newRole } },
    { new: true }
  )

  if (!projectMember) {
    throw new ApiError(404, 'Project member not found')
  }

  return res.json({
    success: true,
    message: 'Project role updated successfully',
    data: projectMember,
  })
})

// ── Delete Member ─────────────────────────────────────────────────────────────
const DeleteProjectMembers = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params

  const projectMember = await ProjectMember.findOneAndDelete({
    project: projectId,
    user: userId,
  })

  if (!projectMember) {
    throw new ApiError(404, 'Project member not found')
  }

  return res.json({
    success: true,
    message: 'Project member deleted successfully',
    data: projectMember,
  })
})

export {
  getProject,
  createProject,
  getProjectById,
  UpdateProject,
  DeleteProject,
  addMemberToProject,
  getProjectMembers,
  UpdateProjectRole,
  DeleteProjectMembers,
}

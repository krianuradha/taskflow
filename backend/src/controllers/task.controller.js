import mongoose from 'mongoose'
import { Task } from '../models/task.model.js'
import { Subtask } from '../models/subtask.model.js'
import { Project } from '../models/project.model.js'
import { User } from '../models/user.model.js'
import { ApiError } from '../utils/api-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { asyncHandler } from '../utils/async-handler.js'

const normalizeTask = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority ?? 'medium',
  dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  assignee: task.assignedTo
    ? {
        id: task.assignedTo._id?.toString(),
        name: task.assignedTo.fullname || task.assignedTo.username || 'Unknown',
        email: task.assignedTo.email,
        role: task.assignedTo.role || 'member',
      }
    : null,
  subTasks: Array.isArray(task.subtasks)
    ? task.subtasks.map((subtask) => ({
        id: subtask._id.toString(),
        title: subtask.title,
        completed: subtask.completed,
      }))
    : [],
  tags: [],
  attachments: Array.isArray(task.attachment)
    ? task.attachment.map((attachment, index) => ({
        id: attachment._id?.toString() || `${task._id}-${index}`,
        name: attachment.url?.split('/').pop() || 'attachment',
        type: attachment.mimetype || 'application/octet-stream',
        url: attachment.url,
        sizeLabel: attachment.size ? `${attachment.size} B` : '',
      }))
    : [],
  createdAt: task.createdAt?.toISOString() || null,
  updatedAt: task.updatedAt?.toISOString() || null,
})

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  })
    .populate('assignedTo', 'fullname email username role')
    .populate('subtasks')
    .exec()

  return res.json(
    new ApiResponse(200, tasks.map(normalizeTask), 'Tasks retrieved successfully')
  )
})

const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const { title, description, assignedTo, status, priority, dueDate } = req.body

  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  if (assignedTo) {
    const assignee = await User.findById(assignedTo)
    if (!assignee) {
      throw new ApiError(404, 'Assigned user not found')
    }
  }

  const task = await Task.create({
    title,
    description,
    project: project._id,
    assignedTo: assignedTo || undefined,
    assignedBy: req.user._id,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate ? new Date(dueDate) : undefined,
  })

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'fullname email username role')
    .populate('subtasks')
    .exec()

  return res.status(201).json(
    new ApiResponse(201, normalizeTask(populatedTask), 'Task created successfully')
  )
})

const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params

  const task = await Task.findOne({ _id: taskId, project: projectId })
    .populate('assignedTo', 'fullname email username role')
    .populate('subtasks')
    .exec()

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  return res.json(
    new ApiResponse(200, normalizeTask(task), 'Task retrieved successfully')
  )
})

const toggleSubtask = asyncHandler(async (req, res) => {
  const { projectId, subtaskId } = req.params
  const { completed } = req.body

  const subtask = await Subtask.findById(subtaskId).populate({
    path: 'task',
    select: 'project',
  })

  if (!subtask || !subtask.task) {
    throw new ApiError(404, 'Subtask not found')
  }

  if (subtask.task.project.toString() !== projectId) {
    throw new ApiError(404, 'Subtask does not belong to this project')
  }

  subtask.completed = Boolean(completed)
  await subtask.save()

  return res.json(
    new ApiResponse(200, {
      id: subtask._id.toString(),
      title: subtask.title,
      completed: subtask.completed,
    }, 'Subtask updated successfully')
  )
})

const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params
  const { title, description, status, priority, dueDate, assignedTo } = req.body

  const task = await Task.findOneAndUpdate(
    { _id: taskId, project: projectId },
    {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo,
    },
    { new: true, runValidators: true }
  )
    .populate('assignedTo', 'fullname email username role')
    .populate('subtasks')
    .exec()

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  return res.json(
    new ApiResponse(200, normalizeTask(task), 'Task updated successfully')
  )
})

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params

  const task = await Task.findOneAndDelete({ _id: taskId, project: projectId }).exec()

  if (!task) {
    throw new ApiError(404, 'Task not found')
  }

  await Subtask.deleteMany({ task: taskId }).exec()

  return res.json(
    new ApiResponse(200, null, 'Task and associated subtasks deleted successfully')
  )
})

export { getTasks, createTask, getTaskById, toggleSubtask, updateTask, deleteTask }

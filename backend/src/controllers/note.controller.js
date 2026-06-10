import mongoose from 'mongoose'
import { Project } from '../models/project.model.js'
import { ProjectNote } from '../models/note.model.js'
import { ApiError } from '../utils/api-error.js'
import { ApiResponse } from '../utils/api-response.js'
import { asyncHandler } from '../utils/async-handler.js'

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const notes = await ProjectNote.find({ project: projectId })
    .populate('createdBy', 'fullname email')
    .sort({ createdAt: -1 })
    .exec()

  const payload = notes.map((note) => ({
    id: note._id.toString(),
    title: note.title,
    body: note.content,
    author: {
      id: note.createdBy._id.toString(),
      name: note.createdBy.fullname || note.createdBy.email,
      email: note.createdBy.email,
      role: note.createdBy.role || 'member',
    },
    createdAt: note.createdAt.toISOString(),
  }))

  return res.json(new ApiResponse(200, payload, 'Notes retrieved successfully'))
})

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const { title, body } = req.body

  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, 'Project not found')
  }

  const note = await ProjectNote.create({
    project: project._id,
    createdBy: req.user._id,
    title,
    content: body,
  })

  await note.populate('createdBy', 'fullname email')

  return res.status(201).json(
    new ApiResponse(201, {
      id: note._id.toString(),
      title: note.title,
      body: note.content,
      author: {
        id: note.createdBy._id.toString(),
        name: note.createdBy.fullname || note.createdBy.email,
        email: note.createdBy.email,
        role: note.createdBy.role || 'member',
      },
      createdAt: note.createdAt.toISOString(),
    }, 'Note created successfully')
  )
})

export { getNotes, createNote }

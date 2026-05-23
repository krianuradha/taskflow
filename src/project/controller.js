import { Project } from "./model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createProject = asyncHandler(async (req, res) => {
  const { name, description, dueDate, members = [] } = req.body;

  if (!req.user) {
    throw new ApiError(401, "Authentication required", []);
  }

  const project = await Project.create({
    name,
    description,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    owner: req.user._id,
    members,
  });

  return res.status(201).json(new ApiResponse(201, project, "Project created successfully"));
});

const getProjects = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required", []);
  }

  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { members: req.user._id }],
  }).populate("owner", "username fullname email");

  return res.status(200).json(new ApiResponse(200, projects, "Projects retrieved successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    throw new ApiError(401, "Authentication required", []);
  }

  const project = await Project.findOne({
    _id: id,
    $or: [{ owner: req.user._id }, { members: req.user._id }],
  }).populate("owner", "username fullname email");

  if (!project) {
    throw new ApiError(404, "Project not found", []);
  }

  return res.status(200).json(new ApiResponse(200, project, "Project retrieved successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, dueDate, members, tasks } = req.body;

  if (!req.user) {
    throw new ApiError(401, "Authentication required", []);
  }

  const project = await Project.findOne({ _id: id, owner: req.user._id });
  if (!project) {
    throw new ApiError(404, "Project not found or permission denied", []);
  }

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (dueDate !== undefined) project.dueDate = dueDate ? new Date(dueDate) : undefined;
  if (members !== undefined) project.members = members;
  if (tasks !== undefined) project.tasks = tasks;

  await project.save();
  return res.status(200).json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.user) {
    throw new ApiError(401, "Authentication required", []);
  }

  const project = await Project.findOneAndDelete({ _id: id, owner: req.user._id });
  if (!project) {
    throw new ApiError(404, "Project not found or permission denied", []);
  }

  return res.status(200).json(new ApiResponse(200, null, "Project deleted successfully"));
});

export { createProject, getProjects, getProjectById, updateProject, deleteProject };

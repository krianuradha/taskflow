
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getProject = asyncHandler(async (req, res) => {
    //test
});

const createProject = asyncHandler(async (req, res) => {
    //test
});

const getProjectById = asyncHandler(async (req, res) => {
    //test
});

const UpdateProject = asyncHandler(async (req, res) => {
    //test
});

const DeleteProject = asyncHandler(async (req, res) => {
    //test
});

const addMemberToProject = asyncHandler(async (req, res) => {
    //test
});

const getProjectMembers = asyncHandler(async (req, res) => {
    //test
});

const UpdateProjectRole = asyncHandler(async (req, res) => {
    //test
});

const DeleteProjectMembers = asyncHandler(async (req, res) => {
    //test
});




export{
    getProject,
    createProject,
    getProjectById,
    UpdateProject,
    DeleteProject,
    addMemberToProject,
    getProjectMembers,
    UpdateProjectRole,
    DeleteProjectMembers
};
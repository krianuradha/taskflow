import { Router } from 'express'
import { authMiddleware, validateProjectAccess } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validation.middleware.js'
import { UserRoleEnum, AvailableUserRole } from '../utils/constants.js'
import { createProjectValidator, addMemberValidator } from '../validators/index.js'
import {
  getProject,
  createProject,
  getProjectById,
  UpdateProject,
  DeleteProject,
  addMemberToProject,
  getProjectMembers,
  UpdateProjectRole,
  DeleteProjectMembers,
} from '../controllers/project.controllers.js'

const router = Router()

router.use(authMiddleware)

router
  .route('/')
  .get(getProject)
  .post(validate(createProjectValidator()), createProject)

router
  .route('/:projectId')
  .get(validateProjectAccess(AvailableUserRole), getProjectById)
  .put(validateProjectAccess([UserRoleEnum.ADMIN]), validate(createProjectValidator()), UpdateProject)
  .delete(validateProjectAccess([UserRoleEnum.ADMIN]), DeleteProject)

router
  .route('/:projectId/members')
  .get(validateProjectAccess(AvailableUserRole), getProjectMembers)
  .post(validateProjectAccess([UserRoleEnum.ADMIN]), validate(addMemberValidator()), addMemberToProject)

router
  .route('/:projectId/members/:userId')
  .get(validateProjectAccess(AvailableUserRole), getProjectMembers)
  .put(validateProjectAccess([UserRoleEnum.ADMIN]), UpdateProjectRole)
  .delete(validateProjectAccess([UserRoleEnum.ADMIN]), DeleteProjectMembers)

export default router

import { Router } from 'express'
import { authMiddleware, validateProjectAccess } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validation.middleware.js'
import { AvailableUserRole } from '../utils/constants.js'
import { createTaskValidator } from '../validators/index.js'
import {
  getTasks,
  createTask,
  getTaskById,
  toggleSubtask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js'

const router = Router()

router.use(authMiddleware)

router
  .route('/:projectId')
  .get(validateProjectAccess(AvailableUserRole), getTasks)
  .post(validateProjectAccess(AvailableUserRole), validate(createTaskValidator()), createTask)

router
  .route('/:projectId/t/:taskId')
  .get(validateProjectAccess(AvailableUserRole), getTaskById)
  .put(validateProjectAccess(AvailableUserRole), updateTask)
  .delete(validateProjectAccess(AvailableUserRole), deleteTask)

router
  .route('/:projectId/st/:subtaskId')
  .put(validateProjectAccess(AvailableUserRole), toggleSubtask)

export default router

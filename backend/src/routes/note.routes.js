import { Router } from 'express'
import { authMiddleware, validateProjectAccess } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validation.middleware.js'
import { AvailableUserRole } from '../utils/constants.js'
import { createNoteValidator } from '../validators/index.js'
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/note.controller.js'

const router = Router()

router.use(authMiddleware)

router
  .route('/:projectId')
  .get(validateProjectAccess(AvailableUserRole), getNotes)
  .post(validateProjectAccess(AvailableUserRole), validate(createNoteValidator()), createNote)

router
  .route('/:projectId/n/:noteId')
  .put(validateProjectAccess(AvailableUserRole), updateNote)
  .delete(validateProjectAccess(AvailableUserRole), deleteNote)

export default router

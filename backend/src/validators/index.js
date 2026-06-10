import { body } from 'express-validator'
import { AvailableUserRole, AvailableTaskStatus } from '../utils/constants.js'

const validateRegistration = () => {
  return [
    body('fullname').trim().notEmpty().withMessage('Fullname is required'),
    body('username')
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 5 }).withMessage('Username must be at least 5 characters long')
      .isLowercase().withMessage('Username must be in lowercase')
      .trim(),
    body('email')
      .trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
      .isStrongPassword().withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol'),
  ]
}

const userValidatorLogin = () => {
  return [
    body('email')
      .trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
  ]
}

const userChangePasswordValidator = () => {
  return [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .isStrongPassword().withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol'),
  ]
}

const userForgotPasswordValidator = () => {
  return [
    body('email')
      .trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
  ]
}

const userResetPasswordValidator = () => {
  return [
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .isStrongPassword().withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol'),
  ]
}

const createProjectValidator = () => {
  return [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description').trim().optional(),
  ]
}

const addMemberValidator = () => {
  return [
    body('email')
      .trim().notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(AvailableUserRole).withMessage('Role must be available in the system'),
  ]
}

const createTaskValidator = () => {
  return [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().optional(),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
    body('status').optional().isIn(AvailableTaskStatus).withMessage('Status is invalid'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
    body('assignedTo').optional().isMongoId().withMessage('Assigned user ID must be a valid Mongo ID'),
  ]
}

const createNoteValidator = () => {
  return [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('body').trim().notEmpty().withMessage('Note body is required'),
  ]
}

export {
  validateRegistration,
  userValidatorLogin,
  userChangePasswordValidator,
  userForgotPasswordValidator,
  userResetPasswordValidator,
  createProjectValidator,
  addMemberValidator,
  createTaskValidator,
  createNoteValidator,
}

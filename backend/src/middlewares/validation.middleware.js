import { validationResult } from 'express-validator'
import { ApiError } from '../utils/api-error.js'

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)))

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((err) => `${err.path || err.param}: ${err.msg}`)
      throw new ApiError(400, 'Validation failed', errorMessages)
    }

    next()
  }
}

export { validate }

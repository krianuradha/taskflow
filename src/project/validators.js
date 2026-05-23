import { body, param } from "express-validator";

const createProjectValidator = () => [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description").optional().isString().withMessage("Description must be a string"),
  body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
  body("members").optional().isArray().withMessage("Members must be an array of user IDs"),
];

const updateProjectValidator = () => [
  param("id").isMongoId().withMessage("Project ID must be valid"),
  body("name").optional().trim().notEmpty().withMessage("Project name cannot be empty"),
  body("dueDate").optional().isISO8601().withMessage("Due date must be a valid date"),
  body("members").optional().isArray().withMessage("Members must be an array of user IDs"),
];

const projectIdValidator = () => [
  param("id").isMongoId().withMessage("Project ID must be valid"),
];

export { createProjectValidator, updateProjectValidator, projectIdValidator };

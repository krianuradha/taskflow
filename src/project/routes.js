import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "./controller.js";
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
} from "./validators.js";
import { validate } from "../middlewares/validation.middleware.js";
import { requireAuth } from "./middleware.js";

const router = Router();

router.use(requireAuth);
router.route("/").get(getProjects).post(validate(createProjectValidator()), createProject);
router.route("/:id").get(validate(projectIdValidator()), getProjectById).put(validate(updateProjectValidator()), updateProject).delete(validate(projectIdValidator()), deleteProject);

export default router;

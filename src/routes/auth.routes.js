import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { validateRegistration, userValidatorLogin } from "../validators/index.js";

const router = Router();
router.route("/register").post(validate(validateRegistration()), registerUser);
router.route("/login").post(validate(userValidatorLogin()), loginUser);
export default router;


import { Router } from "express";
import { registerUser} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { validateRegistration } from "../validators/index.js";

const router=Router();
router.route("/register").post(validate(validateRegistration()),registerUser);
export default router;


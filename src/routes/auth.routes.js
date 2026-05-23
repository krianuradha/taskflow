import { Router } from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    verifyEmail,
    refreshToken,
    forgotPassword,
    resetForgotPassword,
    changePassword,
    getCurrentUser,
    resendEmailVerification
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

import { validate } from "../middlewares/validation.middleware.js";

import {
    validateRegistration,
    userValidatorLogin,
    userForgotPasswordValidator,
    userChangePasswordValidator,
    userResetPasswordValidator
} from "../validators/index.js";


const router = Router();


// ===============================
// PUBLIC ROUTES
// ===============================

router.route("/register").post(
    validate(validateRegistration()),
    registerUser
);

router.route("/login").post(
    validate(userValidatorLogin()),
    loginUser
);

router.route("/verify-email/:emailVerificationToken")
    .get(verifyEmail);

router.route("/refresh-token")
    .post(refreshToken);

router.route("/forgot-password")
    .post(validate(userForgotPasswordValidator()), forgotPassword);

router.route("/reset-password/:resetToken")
    .post(validate(userResetPasswordValidator()), resetForgotPassword);


// ===============================
// PROTECTED ROUTES
// ===============================

router.route("/logout")
    .post(authMiddleware, logoutUser);

router.route("/change-password")
    .post(authMiddleware, validate(userChangePasswordValidator()), changePassword);

router.route("/current-user")
    .get(authMiddleware, getCurrentUser);

router.route("/resend-verification-email")
    .post(authMiddleware, resendEmailVerification);


export default router;
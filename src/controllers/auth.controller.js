import crypto from "crypto";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

import {
    sendEmail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent
} from "../utils/mail.js";


// ===============================
// GENERATE TOKENS
// ===============================
const generateAccessandRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
};


// ===============================
// REGISTER USER
// ===============================
const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullname, password } = req.body;

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(400, "Username or email already exists");
    }

    const newUser = await User.create({
        username,
        email,
        fullname,
        password,
        isEmailVerified: false
    });

    const { unHashedToken, hashedToken, expiry } =
        newUser.generateTemporaryToken();

    newUser.emailVerificationToken = hashedToken;
    newUser.emailVerificationTokenExpiration = expiry;

    await newUser.save({ validateBeforeSave: false });

    await sendEmail({
        email: newUser.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            newUser.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiration"
    );

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


// ===============================
// LOGIN USER
// ===============================
const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Email or username is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
        await generateAccessandRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiration"
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, user: loggedInUser }, "Login successful")
        );
});


// ===============================
// LOGOUT USER
// ===============================
const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: "" }
    });

    return res
        .clearCookie("refreshToken")
        .status(200)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});


// ===============================
// GET CURRENT USER
// ===============================
const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    );
});


// ===============================
// VERIFY EMAIL
// ===============================
const verifyEmail = asyncHandler(async (req, res) => {

    const { emailVerificationToken } = req.params;

    const hashedToken = crypto
        .createHash("sha256")
        .update(emailVerificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiration = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Email verified successfully")
    );
});


// ===============================
// RESEND EMAIL VERIFICATION
// ===============================
const resendEmailVerification = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email already verified");
    }

    const { unHashedToken, hashedToken, expiry } =
        user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpiration = expiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Email Verification",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
        )
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Verification email sent successfully")
    );
});


// ===============================
// REFRESH TOKEN
// ===============================
const refreshToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken =
        req.cookies?.refreshToken ||
        req.body?.refreshToken ||
        req.headers["x-refresh-token"];

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token missing");
    }

    try {

        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded._id);

        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;

        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: true
        };

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed")
            );

    } catch (error) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }
});


// ===============================
// FORGOT PASSWORD
// ===============================
const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { unHashedToken, hashedToken, expiry } =
        user.generateTemporaryToken();

    user.forgetpasswordToken = hashedToken;
    user.forgetpasswordTokenExpiration = expiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user.email,
        subject: "Reset Password",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${unHashedToken}`
        )
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Reset email sent")
    );
});


// ===============================
// RESET PASSWORD
// ===============================
const resetForgotPassword = asyncHandler(async (req, res) => {

    const { resetToken } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgetpasswordToken: hashedToken,
        forgetpasswordTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired token");
    }

    user.password = newPassword;
    user.forgetpasswordToken = undefined;
    user.forgetpasswordTokenExpiration = undefined;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password reset successful")
    );
});


// ===============================
// CHANGE PASSWORD
// ===============================
const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
        throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});


// ===============================
// EXPORTS
// ===============================
export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshToken,
    forgotPassword,
    resetForgotPassword,
    changePassword
};
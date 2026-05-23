import {body} from "express-validator";
const validateRegistration = ()=>{
    return [
        body("fullname").trim().notEmpty().withMessage("Fullname is required"),
        body("username").notEmpty().withMessage("Username is required").isLength({min:5}).withMessage("Username must be at least 5 characters long").isLowercase().withMessage("Username must be in lowercase").trim(),
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
        body("password").notEmpty().withMessage("Password is required").isLength({min:8}).withMessage("Password must be at least 8 characters long").isStrongPassword().withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol"),
    ]
}


const userValidatorLogin = ()=>{
    return[
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
        body("password").notEmpty().withMessage("Password is required"),
    ]
}

const userChangePasswordValidator = ()=>{
    return[
        body("currentPassword").notEmpty().withMessage("Current password is required"),
        body("newPassword").notEmpty().withMessage("New password is required").isLength({min:8}).withMessage("New password must be at least 8 characters long").isStrongPassword().withMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol"),
    ]
}
const userForgotPasswordValidator = ()=>{
    return[
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    ]
}  

const userResetPasswordValidator = ()=>{
    return[
        body("token").notEmpty().withMessage("Reset token is required"),
        body("newPassword").notEmpty().withMessage("New password is required").isLength({min:8}).withMessage("New password must be at least 8 characters long").isStrongPassword().withMessage("New password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol"),
    ]
}

export {
    validateRegistration, 
    userValidatorLogin,
    userChangePasswordValidator, 
    userForgotPasswordValidator,
    userResetPasswordValidator
    }
    //validators for user registration, login, change password, forgot password, and reset password
import {body} from "express-validator";
const validateRegistration = ()=>{
    return [
        body("username").notEmpty().withMessage("Username is required").isLength({min:5}).withMessage("Username must be at least 5 characters long").isLowercase().withMessage("Username must be in lowercase").trim(),
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
        body("password").notEmpty().withMessage("Password is required").isLength({min:8}).withMessage("Password must be at least 8 characters long").isStrongPassword().withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol"),
    ]
}
export {validateRegistration}
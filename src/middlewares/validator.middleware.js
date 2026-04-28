import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";
 
export const validate = (req, res, next) => {
const errors = validationResult(req);
if(errors.isEmpty()){
    return next();      }
const extractedErrors = [];
errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));
throw new ApiError(422, "Validation Error", extractedErrors);   
} // THIS FUNCTION TAKES THE REQUEST, RESPONSE, AND NEXT FUNCTION AS ARGUMENTS. IT USES THE validationResult FUNCTION FROM express-validator TO CHECK FOR ANY VALIDATION ERRORS IN THE REQUEST. IF THERE ARE NO ERRORS, IT CALLS THE next() FUNCTION TO PASS CONTROL TO THE NEXT MIDDLEWARE OR ROUTE HANDLER. IF THERE ARE ERRORS, IT EXTRACTS THEM INTO AN ARRAY OF OBJECTS (WHERE EACH OBJECT CONTAINS THE FIELD NAME AND THE ERROR MESSAGE) AND THEN THROWS A NEW ApiError WITH A 422 STATUS CODE, A "Validation Error" MESSAGE, AND THE ARRAY OF EXTRACTED ERRORS AS THE ERROR DETAILS.

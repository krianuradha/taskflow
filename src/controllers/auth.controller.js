import {user} from "../models/user.model.js";
import {ApiError} from "../utils/apiError.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";

const generateAccessandRefreshTokens = async(userId) => {
    try{
        const newUser=await user.findById(userId);
       const accessToken= user.generateAccessToken();
        const refreshToken=user.generateRefreshToken();
        newUser.refreshToken=refreshToken;
        await newUser.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }// THIS FUNCTION TAKES A USER ID AS AN ARGUMENT, RETRIEVES THE USER FROM THE DATABASE, GENERATES A NEW ACCESS TOKEN AND REFRESH TOKEN USING THE METHODS DEFINED IN THE USER MODEL, STORES THE REFRESH TOKEN IN THE DATABASE, AND RETURNS BOTH TOKENS. IF ANY ERROR OCCURS DURING THIS PROCESS, IT CATCHES THE ERROR AND THROWS A NEW ApiError WITH A 500 STATUS CODE AND AN APPROPRIATE MESSAGE.
    catch(error){

     throw new ApiError(500,"Failed to generate tokens",[]);
    }// IF ANY ERROR OCCURS DURING THIS PROCESS, IT CATCHES THE ERROR AND THROWS A NEW ApiError WITH A 500 STATUS CODE AND AN APPROPRIATE MESSAGE.


}




const registerUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;// req data from frontend
    const exsistedUser=await user.findOne({
        $or:[
            {username},
            {email}]
    })// CHECK IF A USER WITH THE SAME USERNAME OR EMAIL ALREADY EXISTS IN THE DATABASE. THIS IS DONE TO ENSURE THAT USERNAMES AND EMAILS ARE UNIQUE.
 if(exsistedUser){
    throw new ApiError(400,"Username or email already exists",[]);
 }
 const newUser=await user.create({
    username,
    email,
    password,
    isEmailVerified:false,
 })// IF NO SUCH USER EXISTS, CREATE A NEW USER IN THE DATABASE WITH THE PROVIDED USERNAME, EMAIL, AND PASSWORD. THE isEmailVerified FIELD IS SET TO FALSE BY DEFAULT.
 res.status(201).json(new ApiResponse(true,"User registered successfully",newUser))// RESPOND WITH A SUCCESS MESSAGE AND THE NEWLY CREATED USER DATA.



const{unHashedToken,hashedToken,expiry}=
newUser.generateTemporaryToken()// GENERATE A TOKEN AND ITS EXPIRY TIME FOR EMAIL VERIFICATION. THE unHashedToken WILL BE SENT TO THE USER VIA EMAIL, WHILE THE hashedToken WILL BE STORED IN THE DATABASE FOR LATER VERIFICATION.
newUser.emailVerificationToken=hashedToken;
newUser.emailVerificationTokenExpiration=expiry;
await newUser.save({validateBeforeSave:false})// SAVE THE USER WITH THE NEWLY GENERATED TOKEN AND EXPIRY TIME TO THE DATABASE. THE validateBeforeSave OPTION IS SET TO FALSE TO SKIP VALIDATION SINCE WE ARE ONLY UPDATING TOKEN FIELDS.
await sendEmail({
    email:newUser.email,
    subject:"Email Verification",
    mailgenContent:emailVerificationMailgenContent(newUser.username,`${req.protocol}://${req.get("host")}/api/v1/newUser/emailtoken/${unHashedToken}`),})

    const createdUSer=(newUser._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiration -forgetpasswordToken -forgetpasswordTokenExpiration")// AFTER SENDING THE VERIFICATION EMAIL, RETRIEVE THE USER FROM THE DATABASE AGAIN TO EXCLUDE SENSITIVE FIELDS SUCH AS PASSWORD, REFRESH TOKEN, AND TOKENS RELATED TO EMAIL VERIFICATION AND PASSWORD RESET. THIS ENSURES THAT THESE FIELDS ARE NOT SENT BACK TO THE CLIENT IN THE RESPONSE.
    if(!createdUSer){
        throw new ApiError(500,"Failed to create user",[]);
    }
    return res
    .status(200),{user:createdUSer}
    .json(new ApiResponse(true,"User registered successfully",createdUSer))// RESPOND WITH A SUCCESS MESSAGE AND THE CREATED USER DATA, EXCLUDING SENSITIVE FIELDS.
})// THIS FUNCTION SENDS AN EMAIL TO THE USER WITH A VERIFICATION LINK THAT CONTAINS THE unHashedToken. WHEN THE USER CLICKS THE LINK, THEY WILL BE DIRECTED TO AN ENDPOINT THAT WILL VERIFY THE TOKEN AND ACTIVATE THEIR ACCOUNT.
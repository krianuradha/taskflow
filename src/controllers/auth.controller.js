import { User } from "../models/user.js";
import {ApiError} from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";

const generateAccessandRefreshTokens = async(userId) => {
    try{
        const newUser=await User.findById(userId);
       const accessToken= newUser.generateAccessToken();
        const refreshToken= newUser.generateRefreshToken();
        newUser.refreshToken=refreshToken;
        await newUser.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    }// THIS FUNCTION TAKES A USER ID AS AN ARGUMENT, RETRIEVES THE USER FROM THE DATABASE, GENERATES A NEW ACCESS TOKEN AND REFRESH TOKEN USING THE METHODS DEFINED IN THE USER MODEL, STORES THE REFRESH TOKEN IN THE DATABASE, AND RETURNS BOTH TOKENS. IF ANY ERROR OCCURS DURING THIS PROCESS, IT CATCHES THE ERROR AND THROWS A NEW ApiError WITH A 500 STATUS CODE AND AN APPROPRIATE MESSAGE.
    catch(error){

     throw new ApiError(500,"Failed to generate tokens",[]);
    }// IF ANY ERROR OCCURS DURING THIS PROCESS, IT CATCHES THE ERROR AND THROWS A NEW ApiError WITH A 500 STATUS CODE AND AN APPROPRIATE MESSAGE.


}




const registerUser = asyncHandler(async (req, res) => {

    const { username, email, fullname, password } = req.body;
    const exsistedUser=await User.findOne({
        $or:[
            {username},
            {email}]
    })
 if(exsistedUser){
    throw new ApiError(400,"Username or email already exists",[]);
 }
 const newUser=await User.create({
    username,
    email,
    fullname,
    password,
    isEmailVerified:false,
 })

const{unHashedToken,hashedToken,expiry}=
newUser.generateTemporaryToken()
newUser.emailVerificationToken=hashedToken;
newUser.emailVerificationTokenExpiration=expiry;
await newUser.save({validateBeforeSave:false})
await sendEmail({
    email:newUser.email,
    subject:"Email Verification",
    mailgenContent:emailVerificationMailgenContent(newUser.username,`${req.protocol}://${req.get("host")}/api/v1/newUser/emailtoken/${unHashedToken}`),})

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiration -forgetpasswordToken -forgetpasswordTokenExpiration")
    if(!createdUser){
        throw new ApiError(500,"Failed to create user",[]);
    }
    return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered successfully"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;
    if (!email && !password) {
        throw new ApiError(400, "Email and password are required", []);
    }
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (!user) {
        throw new ApiError(401, "Invalid email or password", []);
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid email or password", []);
    }
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiration -forgetpasswordToken -forgetpasswordTokenExpiration");
    
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { accessToken, user: loggedInUser }, "User logged in successfully"));
});

export { registerUser, loginUser };
import { Router } from "express";
import { upload } from "../fileUploadMiddleware/cloudinaryUpload.js"
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/customApiError.js"
import { sendResponse } from "../utils/customResponse.js";
import {catchAsync} from "../utils/catchAsync.js"
import {GlobalErrorHandler} from "../utils/GlobalErrorHandler.js"

const userRoute = Router();

// uploading files on cloudinary, using middleware
    userRoute.use(upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]))

// signUp endpoint
userRoute.post("/signup", catchAsync(async(req,res) =>{

  // take input
  const { fullname,username, email, password } = req.body;
  const files = req.files;

  // 🛑 Check mandatory fields
  if (!username || !email || !password) {
    throw new ApiError(400, "Username, email, and password are required!");
  }

  const checkIfUsernameExists = await User.findOne({username});
  if(checkIfUsernameExists){
      throw new ApiError(402, "Username already taken")
  }

  const checkIfEmailExists = await User.findOne({email});
  if(checkIfEmailExists){
      throw new ApiError(402, "Email already registered!");
  }


  //Checkif avatar uploaded, 
  if (!files || !files.avatar || files.avatar.length === 0) {
    throw new ApiError(400, "Avatar is required!");   // avatar is mandatory
  }

  //Check avatar file upload success (path/url should exist)
  const avatarFile = files.avatar[0];
  if (!avatarFile.path) {       // check if cloudinary middleware returned image url
    throw new ApiError(500, "Avatar upload failed!");
  }

  // CoverImage is OPTIONAL, but if provided, check if upload was successful
  let coverImageUrl = null;
  if (files.coverImage && files.coverImage.length > 0) {
    const coverFile = files.coverImage[0];
    if (!coverFile.path) {
      throw new ApiError(500, "Cover image upload failed!");
    }
    coverImageUrl = coverFile.path;
  }

  // create entry in db
  const response = await User.create({
      fullname,
      username : username.toLowerCase(),
      email,
      password,
      avatar : avatarFile.path,
      coverImage : coverImageUrl
  })

  // return some specific response data
  const createdUser = await User.findById(response._id).select("-password -refreshToken");

  if(!createdUser) throw new ApiError(501,"Error while registering user!");

  // sending custom response
  sendResponse(res,{
      statuscode: 200,
      message : "user registered successfully!",
      success : true,
      data : createdUser
  })
}))


// signin endpoint
userRoute.post("/signin", catchAsync(async(req,res) => {

  const {username, password} = req.body;
  
  if(!username || !password){
    throw new ApiError(400, "Username and password both are required!")
  }

  const foundUser = await User.findOne({username});

  if(!foundUser){
    throw new ApiError(401,"User not found! Please Register!")
    }

  const checkPassword = await foundUser.isPasswordCorrect(password);

  if(!checkPassword){
    throw new ApiError(401, "Incorrect password!")
  }

  // finally when username and password both are correct, generate both access and refresh tokens
  //has generate access and refresh token methods associated with userSchema
  const accessToken = foundUser.generateAccessToken();
  const refreshToken = foundUser.generateRefreshToken();
  
  // storing refreshToken to db
  foundUser.refreshToken = refreshToken;
  await foundUser.save();     ///saving user with updated refreshToken

  const options = {
    httpOnly: true,               // 🛡️ cannot be accessed via JS
    secure: true,
    sameSite : "Strict"
  }


  return res
  .cookie("refreshToken",refreshToken,options)
  .cookie("accessToken", accessToken,options)
  .status(200).json(
    sendResponse(res,{
      statuscode : 200,
      success : true,
      message : "User signed In !",
      data : {
        user : {
        user_id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        fullname: foundUser.fullname,
        },
      accessToken,
      refreshToken
      }
    })
  )

}))



// passing all the caught errors to globalErrorhandler for standardized response
userRoute.use(GlobalErrorHandler)

export default userRoute;
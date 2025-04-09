import { Router } from "express";
import { upload } from "../fileUploadMiddleware/cloudinaryUpload.js"
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/customApiError.js"
import { sendResponse } from "../utils/customResponse.js";


const userRoute = Router();

// uploading files on cloudinary
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

userRoute.post("/signup", async(req,res) =>{

    // take input
    const { fullname,username, email, password } = req.body;
    const files = req.files;

    // 🛑 Check mandatory fields
    if (!username || !email || !password) {
      throw new ApiError(400, "Username, email, and password are required!");
    }

    //Check avatar presence (MANDATORY)
    if (!files || !files.avatar || files.avatar.length === 0) {
      throw new ApiError(400, "Avatar is required!");
    }

    //Check avatar file upload success (path/url should exist)
    const avatarFile = files.avatar[0];
    if (!avatarFile.path) {
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

    const checkIfUsernameExists = await User.findOne({username});
    if(checkIfUsernameExists){
        throw new ApiError(402, "Username already taken")
    }

    const checkIfEmailExists = await User.findOne({email});
    if(checkIfEmailExists){
        throw new ApiError(402, "Email already registered!");
    }


    // create entry in db
    const response = await User.create({
        fullname,email,password,
        username : username.toLowerCase(),
        avatar : avatarFile.path,
        coverImage : coverImageUrl
    })

    const createdUser = await User.findById(response._id).select("-password -refreshToken");

    if(!createdUser) throw new ApiError(501,"Error while registering user!");

    // sending custom response
    sendResponse(res,{
        statuscode: 200,
        message : "user registered successfully!",
        success : true,
        data : createdUser
    })


})

export default userRoute;
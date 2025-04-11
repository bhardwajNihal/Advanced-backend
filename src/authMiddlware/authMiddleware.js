// token based authorization of users

import { access_token_secret } from "../configs.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/customApiError.js";
import jwt from "jsonwebtoken"

export async function AuthMiddleware(req,res,next) {
    
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    
        if(!token){
            throw new ApiError(400, "access token not provided!");
        }
    
        const verified = jwt.verify(token,access_token_secret);
    
        if(!verified){
            throw new ApiError(401,"Invalid access token!");
        }
    
        const foundUser = await User.findOne({_id : verified._id}).select("-password -refreshToken")    //options to select except these two
    
        if(!foundUser){
            throw new ApiError(401,"Invalid access token!");
        }
    
        req.user = foundUser;
        next();
    } catch (error) {
        throw new ApiError(401,"Invalid access token!")
    } 

}
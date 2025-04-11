import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import {access_token_expiry,access_token_secret,refresh_token_expiry,refresh_token_secret} from "../configs.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({

        fullname : {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        username : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,                 // remove unwanted spaces, make db uniform
            index: true,                // facilitates searching
        },
        email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatar : {
            type: String           //cloudinary url
        },             
        coverImage : {
            type: String           //cloudinary url
        }, 
        watchHistory : [            // an array of objects, which stores info about the watch videos
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",                               //reference to the video model
            }
        ],
        password : {
            type : String,
            required : [true, 'password is required']
        }
    },
    {timestamps: true}      // when true, mongoose automatically add created_at, updated_at
);


// a middleware (a pre-save hook), that runs before saving document to db, and hashes the password, then calls next()
    userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) return next(); 
        // Only hash if password was changed or set
    
        this.password = await bcrypt.hash(this.password, 10); 
        // Hash password with saltRounds = 10
    
        next(); // Move on to the actual save
    });

// method to compare the plain text password (from login form) with the hashed one in the database using bcrypt.
    userSchema.methods.isPasswordCorrect = async function(password){
        return await bcrypt.compare(password, this.password)    //this.password refers to the hashed password in the database.
    }


// method to generate jwt access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        access_token_secret,
        {
            expiresIn: access_token_expiry
        }
    )
}

//method to generate a refresh token — used to get new access tokens when the old one expires.
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        refresh_token_secret,
        {
            expiresIn: refresh_token_expiry
        }
    )
}




export const User = mongoose.model("User", userSchema)
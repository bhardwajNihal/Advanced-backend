import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userShchema = new mongoose.Schema({

        Fullname : {
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
    {timestamps: true}
);

// can write some logic to be executed just before or after the data is saved to the db,
// like : password hashing, generating access and refresh tokens
// mongoose provide some inbuilt methods

export const User = mongoose.model("User", userShchema)
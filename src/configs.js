
// configuring all environment variables in a single file, avoid repetition

import dotenv from "dotenv";
dotenv.config({
    path : "../.env"
});

export const mongodb_connection_string = process.env.MONGODB_CONNECTION_STRING;
export const db_name = "View-tube"
export const cloudinary_cloud_name = process.env.cloudinary_cloud_name;
export const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
export const cloudinary_api_secret = process.env.cloudinary_api_secret
export const port = process.env.PORT

export const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
export const access_token_expiry = process.env.ACCESS_TOKEN_EXPIRY;
export const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;
export const refresh_token_expiry = process.env.ACCESS_TOKEN_EXPIRY;

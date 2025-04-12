import { Router } from "express";
import { upload } from "../fileUploadMiddleware/cloudinaryUpload.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/customApiError.js";
import { sendResponse } from "../utils/customResponse.js";
import { catchAsync } from "../utils/catchAsync.js";
import { GlobalErrorHandler } from "../utils/GlobalErrorHandler.js";
import { AuthMiddleware } from "../authMiddlware/authMiddleware.js";
import jwt from "jsonwebtoken";
import { refresh_token_secret } from "../configs.js";
import mongoose from "mongoose";

const userRoute = Router();

// uploading files on cloudinary, using middleware
userRoute.use(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ])
);

// signUp endpoint
userRoute.post(
  "/signup",
  catchAsync(async (req, res) => {
    // take input
    const { fullname, username, email, password } = req.body;
    const files = req.files;

    // 🛑 Check mandatory fields
    if (!username || !email || !password) {
      throw new ApiError(400, "Username, email, and password are required!");
    }

    const checkIfUsernameExists = await User.findOne({ username });
    if (checkIfUsernameExists) {
      throw new ApiError(401, "Username already taken");
    }

    const checkIfEmailExists = await User.findOne({ email });
    if (checkIfEmailExists) {
      throw new ApiError(401, "Email already registered!");
    }

    // console.log("files : ",files);   // returns an object with avatar and coverImage(if any).
    // avatar and coverImage will have path to cloud storage, if uploaded successfully

    //Checkif avatar uploaded,
    if (!files || !files.avatar || files.avatar.length === 0) {
      throw new ApiError(400, "Avatar is required!"); // avatar is mandatory
    }

    //Check avatar file upload success (path/url should exist)
    const avatarFile = files.avatar[0];
    if (!avatarFile.path) {
      // check if cloudinary middleware returned image url
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
      username: username.toLowerCase(),
      email,
      password,
      avatar: avatarFile.path,
      coverImage: coverImageUrl,
    });

    // return some specific response data
    const createdUser = await User.findById(response._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) throw new ApiError(501, "Error while registering user!");

    // sending custom response
    sendResponse(res, {
      statuscode: 200,
      message: "user registered successfully!",
      success: true,
      data: createdUser,
    });
  })
);

// signin endpoint
userRoute.post(
  "/signin",
  catchAsync(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new ApiError(400, "Username and password both are required!");
    }

    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      throw new ApiError(401, "User not found! Please Register!");
    }

    const checkPassword = await foundUser.isPasswordCorrect(password);

    if (!checkPassword) {
      throw new ApiError(401, "Incorrect password!");
    }

    // finally when username and password both are correct, generate both access and refresh tokens
    //has generate access and refresh token methods associated with userSchema
    const accessToken = foundUser.generateAccessToken();
    const refreshToken = foundUser.generateRefreshToken();

    // storing refreshToken to db
    foundUser.refreshToken = refreshToken;
    await foundUser.save(); ///saving user with updated refreshToken

    const options = {
      httpOnly: true, // 🛡️ cannot be accessed via JS, prevents xss
      secure: true,
      sameSite: "Strict", //prevents CSRF
    };

    return res
      .cookie("refreshToken", refreshToken, options)
      .cookie("accessToken", accessToken, options)
      .status(200)
      .json(
        sendResponse(res, {
          statuscode: 200,
          success: true,
          message: "User signed In !",
          data: {
            user: {
              user_id: foundUser._id,
              username: foundUser.username,
              email: foundUser.email,
              fullname: foundUser.fullname,
            },
            accessToken,
            refreshToken,
          },
        })
      );
  })
);

//logout endpoint
userRoute.post(
  "/logout",
  AuthMiddleware,
  catchAsync(async (req, res) => {
    // fetch userId
    const userId = req.user._id;

    //remove refresh token from db
    await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    //finally remove cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("refreshToken", options)
      .clearCookie("accessToken", options)
      .json(
        sendResponse(res, {
          success: true,
          message: "user logged out!",
          data: {},
        })
      );
  })
);

// endpoint to refresh access token
userRoute.post(
  "/refresh-token",
  catchAsync(async (req, res) => {
    //workflow
    // Access token expired? → Use refresh token to get a new one (no login needed).
    // Refresh token expired? →  Can’t continue session. User must login again.

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError("400", "refresh token not provided!");
    }

    try {
      const verifyToken = jwt.verify(refreshToken, refresh_token_secret);

      if (!verifyToken) {
        throw new ApiError(400, "Invalid refresh token!");
      }

      const foundUser = await User.findOne({ _id: verifyToken._id });

      if (!foundUser) {
        throw new ApiError(400, "Token invalid!");
      }

      if (foundUser.refreshToken !== refreshToken) {
        throw new ApiError(400, "refresh token expired!"); // in this case user needs to relogin
      }

      // finally generate new refresh and access token
      const newAccessToken = foundUser.generateAccessToken();
      const newRefreshToken = foundUser.generateRefreshToken();

      // save new refresh token to db
      foundUser.refreshToken = newRefreshToken;
      foundUser.save();

      // finally set cookies and send response
      const options = {
        httpOnly: true, // 🛡️ cannot be accessed via JS, prevents xss
        secure: true,
        sameSite: "Strict", //prevents CSRF
      };

      res
        .status(200)
        .cookie("refreshToken", newRefreshToken, options)
        .cookie("accessToken", newAccessToken, options)
        .json(
          sendResponse(res, {
            statuscode: 200,
            success: true,
            message: "Access token refreshed successfully!",
            data: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
          })
        );
    } catch (error) {
      throw new ApiError(403, "Invalid refresh token!");
    }
  })
);

// endpoint to update password
userRoute.put(
  "/update-password",
  AuthMiddleware,
  catchAsync(async (req, res) => {
    const { oldPassword, newPassword, cfmPassword } = req.body;

    if (!(oldPassword || newPassword || cfmPassword)) {
      throw new ApiError(400, "these fields are required!");
    }

    if (!(newPassword === cfmPassword)) {
      throw new ApiError(400, "new and confirm passwords must match!");
    }

    // check if oldpassword is correct
    const foundUser = await User.findOne({ _id: req.user?.id });
    const isPasswordCorrect = await foundUser.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Old password is incorrect!");
    }

    // finally change the new password
    foundUser.password = newPassword;
    await foundUser.save({ validateBeforeSave: false });

    res.status(200).json(
      sendResponse(res, {
        statuscode: 200,
        success: true,
        message: "password updated successfully!",
        data: {},
      })
    );
  })
);

//endpoint to fetch current user detail
userRoute.get(
  "/userData",
  AuthMiddleware,
  catchAsync(async (req, res) => {
    res.status(200).json(
      sendResponse(res, {
        statuscode: 200,
        success: true,
        message: "user data fetched succesfully!",
        data: req.user,
      })
    );
  })
);

// endpoint to update name and email
userRoute.post(
  "/update-profile",
  AuthMiddleware,
  catchAsync(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
      throw new ApiError(400, "All fields are required");
    }

    const foundUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullName,
          email,
        },
      },
      { new: true } // return latest info after update
    ).select("-password");

    res.status(200).json(
      sendResponse(res, {
        statuscode: 200,
        success: true,
        message: "profile data updated successfully!",
        data: foundUser,
      })
    );
  })
);

// endpoint to update avatar image
userRoute.put(
  "/update-avatar",
  upload.fields([{ name: "updatedAvatar", maxCount: 1 }]),
  AuthMiddleware,
  catchAsync(async (req, res) => {
    const updatedAvatarPath = req.files?.updatedAvatar?.[0].path;
    if (!updatedAvatarPath) {
      throw new ApiError(501, "Failed updating Avatar!");
    }

    // update path in db
    const foundUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: updatedAvatarPath,
        },
      },
      { new: true }
    ); // returns latest data

    res.status(200).json(
      sendResponse(res, {
        statuscode: 200,
        success: true,
        message: "avatar updated succesfully!",
        data: foundUser.avatar,
      })
    );
  })
);

// endpoint to update coverImage
userRoute.put(
  "/update-coverImage",
  upload.fields([{ name: "updatedCoverImage", maxCount: 1 }]),
  AuthMiddleware,
  catchAsync(async (req, res) => {
    const updatedCoverImagePath = req.files?.updatedCoverImage?.[0].path;
    if (!updatedCoverImagePath) {
      throw new ApiError(501, "Failed updating cover image!");
    }

    // update path in db
    const foundUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          coverImage: updatedCoverImagePath,
        },
      },
      { new: true }
    );

    res.status(200).json(
      sendResponse(res, {
        statuscode: 200,
        success: true,
        message: "cover image updated succesfully!",
        data: foundUser.coverImage,
      })
    );
  })
);

// endpoint to fetch complete profile details of a channel, in youtube like video streaming app
userRoute.get(
  "/profile/:id",
  AuthMiddleware,
  catchAsync(async (req, res) => {
    const { username } = req.params; // profile/username endpoint

    if (!username) {
      throw new ApiError(400, "username not provided!");
    }

    // writing mongoDb aggregation piplines to fetch details based on logic
    // Aggregation allows you to perform advanced queries and computations in MongoDB, like joins ($lookup), computed fields ($addFields), and filters ($match)

    const channelDetails = await User.aggregate([
      //1st pipeline to filter out user, whose profile is to be fetched
      {
        $match: { username: username.toLowerCase() },
      },
      //2nd pipeline join the subscriptions collection where the channel field matches the user's _id.
      // thus getting the no. of subscribers of the visited channel
      {
        $lookup: {
          from: "subscriptions", // the model to choose from
          localField: "_id", // what field from current user to match from
          foreignField: "channel", // channel is nothing but a objectId i.e. userId
          as: "subscribers", // result name
        },
      },
      //3rd pipeline to join the subscriptions collection where the subscribers field matches the user's id
      // thus getting the no. of channels the channel owner himself subscribed to
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo",
        },
      },
      //4th pipeline to return the required fields
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
          subscribedToCount: {
            $size: "$subscribedTo",
          },
          //check if the current logged In user is in the subscribers list
          isSubscribed: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      //finally adding the fields we want to return to the client
      {
        $project: {
          fullName: 1,
          username: 1,
          email: 1,
          avatar: 1,
          coverImage: 1,
          subscribersCount: 1,
          subscribedToCount: 1,
          isSubscribed: 1,
        },
      },
    ]);

    if (!channelDetails.length) {
      throw new ApiError(403, "channel does not exists!");
    }

    // finally return the detailed response
    res.status(200).json(
      sendResponse(res, {
        statuscode: 200,
        success: true,
        message: "Channel details fetched successfully!",
        data: channelDetails[0], // data is returned as an array usually 1st index is populated
      })
    );
  })
);

// another endpoint using aggregation pipiline to fetch user's watch history
userRoute.get(
  "/watch-history",
  AuthMiddleware,
  catchAsync(async (req, res) => {
    const user = await User.aggregate([
      {
        $match: { _id: new mongoose.Schema.Types.ObjectId(req.user?._id) }, // this conversion is mandatory, as its not automatically handled in aggregation pipelines, like mongoDb documents
      },
      {
        $lookup: {
          from: "videos", // join videos doc, to user's.
          localField: "watchHistory", //matching watchHistory in user's doc,
          foreignField: "_id", //to the _id of videos doc
          as: "watchHistory", // return as watch history
          pipeline: [     // a nested pipeline to join each video with the owner's user profile,
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {     // return only these fields from user's doc after join
                      fullName: 1,
                      username: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json(
      sendResponse(res, {
        message: "Watch history fetched!",
        data: user[0].watchHistory,
      })
    );
  })
);

//todos
// 1. adding subscription schema✅
// 2. update password endpoint✅
// 3. update profile endpoint✅
// 4. update avatar endpoint✅
// 5. update coverImage endpoint✅
// 6. add aggregation pipelines to
  // - fetch a channel's profile details.✅
  // - fetch a user's watch history✅

  
// passing all the caught errors to globalErrorhandler for standardized response
userRoute.use(GlobalErrorHandler);

export default userRoute;

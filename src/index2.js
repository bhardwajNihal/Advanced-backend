// const express = require("express");
// const app = express();

// import {ApiError} from "./utils/customApiError.js";
// import {sendResponse} from "./utils/customResponse.js"
// import {GlobalErrorHandler} from "./utils/GlobalErrorHandler.js"

// // ✅ You can have N number of routes, each doing its own thing (like async DB/API calls).
// // ✅ Any route can fail unexpectedly (e.g. database down, invalid input, etc.).
// // ✅ Instead of repeating error handling code (res.status().json(...)) inside every single route, you just:
//     // throw new ApiError(...) (for sync code)
// // or next(err) inside a try/catch (for async code)
// // ✅ These errors are all passed to one central middleware, the global error handler, at the bottom of your app.js.

// app.get("/signin", async(req,res,next)=>{
//     const {email,password} = req.body;

//     // synchronous operation - custom ApiError is thrown
//     if(!email || !password) throw new ApiError(403,"Invalid Inputs!")     

//     try {
//         // async db call to search for registered user
//         const user = {id:1, name:"nihal"};      
//         sendResponse(res,{              // if successful, sending custom response
//             statuscode : 200,
//             message: "user signed in !",
//             success: true,
//             data : user
//         })
//     } catch (err) {
//         next(err)           // passing down the error to the global handler via next()
//     }
// })

// app.get("/data", async(req,res,next)=>{     

//     try {
//         // async call to fetch data                   
//         // if success send custom response                 
//     } catch (err) {
//         next(err)       // if failed again passed down the error to global handler
//     }
// })


// app.use(GlobalErrorHandler);        // catches errors from each route, send standardized response

// app.listen(3000)
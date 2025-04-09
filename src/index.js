// importing express
    import express from "express"
    const app = express()
    import { port } from "./configs.js";
// import function that have the db connection logic
    import connectDatabase from "./db/index.js";

// middleware to securely access cookies from user's browser
    import cookieParser from "cookie-parser";
    app.use(cookieParser())

//importing and configuring cors 
    import cors from "cors"
    app.use(cors());

// a middleware to accept json
    app.use(express.json({
        limit : "16kb",           // can add a cap about max limit of json to be accepted
    }))

// a middleware to accept encoded urls
    app.use(express.urlencoded({
        extended : true,            //optional attributes, to accepted nested objects
        limit : "16kb"
    }))

    app.use(express.static("public"))           // for public assets


// importing routes, 
import userRoute from "./routes/userRoutes.js";

app.use("/user", userRoute)




// invoking the imported dbconnection function
    connectDatabase()
    .then(() => {                               // async function returns a promise, thus can use .then and .catch block
        app.listen(port, ()=> {
            console.log("server listening at port ", port);
        })
    }).catch((error) => {
        console.log("Database connection failed!!!", error);
    })


// database connection logic

import mongoose from "mongoose";
import {mongodb_connection_string, db_name} from "../configs.js"

const connectDatabase = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${mongodb_connection_string}/${db_name}`);
        // console.log(connectionInstance);
        console.log("Database connected successfully!!!");
        
    }catch(error){
        console.log("Error occurred while connecting to Database", error);
        process.exit(1)         // exit the application as the error is critical (can't continue without connecting to database)
                                //can throw error to propagate it to global level handlers
    }
}

export default connectDatabase
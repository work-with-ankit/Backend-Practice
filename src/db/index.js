
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const ConnectDB= async()=>{
    try {
       const connectionInstance=   await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
         console.log(`mongodb id connnected !! db host : ${connectionInstance.connection.host}`)

    } catch (error) {
        console.log("mongosdb connectiion error", error);
        process.exit(1);
        
    }
}


export default ConnectDB
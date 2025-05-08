// require('dotenv').config({path: "./env"});

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express"

import dotenv from "dotenv";    
import ConnectDB from "./db/index.js";





ConnectDB();






// ;( async () => {
//     try {
//        await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//        app.on("error", (error)=>{
//         console.log("ERROR:", error);
//         throw error  
//        });

//        app.listen(process.env.PORT, ()=>{
//         console.log("ERR :", error);
//         throw error
//        })

//     } catch (error) {
//         console.log("ERROR :", error)
//         throw err
        
//     }
// }) ()
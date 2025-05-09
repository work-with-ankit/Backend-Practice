// require('dotenv').config({path: "./env"});

// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express"

import dotenv from "dotenv";    
import ConnectDB from "./db/index.js";
import {app} from './app.js';
dotenv.config({
     path:'./env'
})





ConnectDB()

   .then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
      console.log(`server is running at port : ${process.env.PORT}`);
    })
      })
 .catch((err)=>{
    console.log("mongo db connection failed", err);
   });






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
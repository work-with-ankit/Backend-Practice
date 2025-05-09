import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({limit:"kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser);

// import routes
import userRouter from "./routes/user.routes.js";

// routes declare
app.use("/api/v1/user", userRouter)

// http:localhost:8000/api/v1/user/register


export {app}
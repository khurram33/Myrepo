import express from "express"
import cors from cors
import cookieParser from "cookie-parser";

const app = express();

//different url
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))

//middleware
app.use(express.json({limit:"16kb"}))  // get data from form submission
app.use(express.urlencoded({extended: true, limit: "16kb"})) // get data from url 
app.use(express.static("public")) // store files in public folder
app.use(cookieParser()) //set server cookies


export {app}
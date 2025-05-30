import express from "express";
import cookieParser from "cookie-parser";
//const cookieParser = require("cookie-parser");
import cors from "cors";

const app = express()
 
app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))

app.use(express.static("public"))

// import userroutes
import userRouter from "./routes/user.routes.js";


//routes decalaration

app.use("/api/v1/users",userRouter)

// import movie routes
import movieRouter from "./routes/movie.routes.js";

//routes decalaration
app.use("/api/v1/movies",movieRouter)

//import REVIEW_ROUTER from "./routes/review.routes.js";

// For general review operations like getting ALL reviews or a review by its direct ID
//app.use('/api/v1/reviews', REVIEW_ROUTER); // Mount reviewRouter at the top level
export { app }
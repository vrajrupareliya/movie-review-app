import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asynchandler(async(req, _res, next) => {
    try {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error("CRITICAL CONFIGURATION ERROR: ACCESS_TOKEN_SECRET is not defined in environment variables.");
            // This is a server configuration issue, so 500 is appropriate.
            // asynchandler will pass this to the global error handler.
            throw new ApiError(500, "Internal Server Configuration Error: Missing critical token secret.");
        }
        
     
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        //console.log("Token extracted:", token);
        //const token = req?.cookies?.accessToken || req.header
        //("Authorization")?.split(" ")[1];

        if (!token) {
            throw new ApiError(400,"unauthorizzed request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(400, "Invalid accessToken")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message ||"invalid accessToken")
    }

})
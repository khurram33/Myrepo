import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJwt = asyncHandler(async(req, res, next)=>{

       try {
       const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

 
        if (!token) {
         throw new ApiError(401, "Unauthorized Access");
        }
 
       const decodedat  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
       const user  = await User.findById(decodedat?._id).select("-password -refreshToken");
 
       if (!user) {
          throw new ApiError(401, "Invalid Access Token");
       }
 
       req.user = user;
       next();
       } catch (error) {
         console.error("JWT Error:", error.message);
        throw new ApiError(401, "Invalid Access Token Request")
       }

})

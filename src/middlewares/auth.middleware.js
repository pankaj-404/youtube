import jwt from "jsonwebtoken"

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

//middleware for auth with verify jwt
const verifyJwt = asyncHandler(async (req, _, next) => {
    try {
        const assessToken = req.cookies?.assessToken || req.header("Authorization")?.replace("Bearer ", "")
        // console.log("🚀 ~ file: auth.middleware.js:9 ~ verifyJwt ~ assessToken:", assessToken)
        // const refreshToken = req.cookies("refreshToken")

        if (!assessToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(assessToken, process.env.ACCESS_TOKEN_SECRET)
        // console.log("🚀 ~ file: auth.middleware.js:16 ~ verifyJwt ~ decodedToken:", decodedToken)

        if (!decodedToken) {
            throw new ApiError(401, error.message || "Unauthorized request")
        }

        //find user by id
        const user = await User.findById(decodedToken._id)
            // console.log("🚀 ~ file: auth.middleware.js:23 ~ verifyJwt ~ user:", user)
            ?.select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Unauthorized request")
        }

        req.user = user
        // console.log("🚀 ~ file: auth.middleware.js:30 ~ verifyJwt ~ req.user:", req.user)

        next()
    } catch (error) {
        console.log("🚀 ~ file: auth.middleware.js:37 ~ verifyJwt ~ error:", error)
        // next(error)
        throw new ApiError(401, error.message || "Invalid access token")
    }
})

export { verifyJwt }
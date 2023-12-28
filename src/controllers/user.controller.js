import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { fileUploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { accessTokenOptions, refreshTokenOptions } from "../constants.js";

// generateAccessAndRefreshTokens function for generating access and refresh token
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh token");
    }
};

//steps to make register function
// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, file, password } = req.body;

    // console.log("🚀 ~ file: user.controller.js:12 ~ registerUser ~ req.body:", req.body)

    // if(!username || username.length === 0 || !email || email.length === 0 || !fullName || fullName.length === 0 || !password || password.length === 0) {
    //     throw new ApiError(400, "All fields are required")
    // }

    //use array some method to check if any element of an array satisfies the condition
    if (
        [username, email, fullName, password].some(
            (field) => !field || field.trim().length === 0
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    if (`${password}`.length < 8) {
        throw new ApiError(
            400,
            "Password should be at least 8 characters long"
        );
    }
    //check if email is valid
    if (email) {
        if (
            !email.match(
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            )
        ) {
            throw new ApiError(400, "Invalid email");
        }
    }
    //check if username or email already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(400, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath =
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0 &&
        req.files?.coverImage[0]?.path;

    //check if avatarLocalPath is not null
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // if(!coverImageLocalPath) {
    //     throw new ApiError(400, "Cover image is required")
    // }

    //upload avatarLocalPath and coverImageLocalPath to cloudinary
    const avatarCloudinaryUrl = await fileUploadOnCloudinary(avatarLocalPath);
    let coverImageCloudinaryUrl = null;
    if (coverImageLocalPath) {
        coverImageCloudinaryUrl =
            await fileUploadOnCloudinary(coverImageLocalPath);
    }

    //check if avatarCloudinaryUrl is not null
    if (!avatarCloudinaryUrl) {
        throw new ApiError(400, "Failed to upload avatar");
    }

    const newUser = await User.create({
        username: username.toLowerCase(),
        avatar: avatarCloudinaryUrl?.url,
        coverImage: coverImageCloudinaryUrl?.url || null,
        email,
        fullName,
        password,
    });

    if (!newUser) {
        throw new ApiError(500, "Failed to create user");
    }
    // console.log("🚀 ~ file: user.controller.js:78 ~ registerUser ~ newUser:", newUser)
    const userWithoutSensitiveInfo = await User.findById(newUser._id).select(
        "-password -refreshToken"
    );
    // console.log("🚀 ~ file: user.controller.js:80 ~ registerUser ~ userWithoutSensitiveInfo:", userWithoutSensitiveInfo)

    res.status(201).json(
        new ApiResponse(
            201,
            userWithoutSensitiveInfo,
            "User created successfully"
        )
    );
});

// loginUser function with asyncHandler, jwt token and refresh token
// 1. req body -> data
// 2. check if email and password are not null
// 3. find the user
// 4. password check
// 5. access and refresh token
// 6. send cookie
const loginUser = asyncHandler(async (req, res) => {
    // 1. req body -> data
    const { email, password, username } = req.body;
    // console.log("🚀 ~ file: user.controller.js:123 ~ loginUser ~ { email, password, username }:", { email, password, username })

    // 2. check if email and password are not null
    if (!(username || email)) {
        throw new ApiError(404, "username or email is required");
    }

    // 3. find the user by email or username
    const user = await User.findOne({ $or: [{ email }, { username }] });

    // 3.1. user check
    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    //4. password check
    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    // 5. access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    // 6. send cookie and send res with access token
    return res
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Login successful"
            )
        );
});

//logout function
const logoutUser = asyncHandler(async (req, res) => {
    // delete refresh token in database
    const user = req.user;
    // console.log("🚀 ~ file: user.controller.js:171 ~ logoutUser ~ user:", user)

    //update refresh token
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { refreshToken: null } },
        { new: true, useFindAndModify: false }
    );
    // console.log("🚀 ~ file: user.controller.js:178 ~ logoutUser ~ updatedUser:", updatedUser)

    // clear cookies
    return res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .status(200)
        .json(new ApiResponse(200, null, "Logout successful"));
});

//refreshAccessToken function
const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.header("Authorization")?.replace("Bearer ", "") || req.body.refreshToken || req.cookies?.refreshToken

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        //verify refresh token with jwt
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (!decodedToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        //find user
        //check if refresh token matches
        const foundUser = await User.findById(decodedToken._id);

        if (!foundUser) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // console.log("🚀 ~ file: user.controller.js:236 ~ refreshAccessToken ~ (foundUser.refreshToken !== incomingRefreshToken):", { refreshToken: foundUser.refreshToken, incomingRefreshToken })

        if (foundUser.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh token not matched");
        }


        //generate new access and refresh token
        const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
            foundUser._id
        );

        //send cookie
        return res
            .cookie("accessToken", newAccessToken, accessTokenOptions)
            .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { newAccessToken, newRefreshToken },
                    "Refresh access token successful"
                )
            );
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token");
    }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };

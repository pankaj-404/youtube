import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required."],
        unique: [true, "Username should be unique."],
        lowercase: true,
        trim: true,
        index: true,
        min: [3, "Username should be at least 3 characters long."],
        max: [20, "Username should be less then 20 characters long."]
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: [true, "Email should be unique."],
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: [true, "Full name is required."],
        lowercase: true,
        trim: true,
    },
    avatar: {
        type: String, //cloudinary url
        required: [true, "Avatar is required."],
    },
    coverImage: {
        type: String,
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    password: {
        type: String,
        required: [true, "Password is required."],
        min: [8, "Password should be at least 8 characters long."]
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 12)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = model("User", userSchema) 
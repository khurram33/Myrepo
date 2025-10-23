import { config } from "../config/config.js";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  watchHistory: [{
    type: Schema.Types.ObjectId,
    ref: "Video"
  }]
}, {
  timestamps: true
});

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};



// 🪙 Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET, // ✅ corrected
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY // ✅ corrected spelling
    }
  );
};

// ♻️ Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET, // ✅ corrected
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY // ✅ corrected
    }
  );
};

export const User = mongoose.model("User", userSchema);

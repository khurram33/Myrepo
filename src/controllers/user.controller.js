import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import path from "path";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken  = async(userId) => {

  try {
    const user = await User.findById(userId);

    if (!user) {
     throw new ApiError(404, "User not found while generating tokens");
  }
 
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(); 
    
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken, refreshToken}

  } catch (error) {

    throw new ApiError(500, error.message || "Error generating access/refresh tokens");

  }

    

}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // 1️⃣ Empty field validation
  if ([username, email, password, fullName].some((field) => !field?.trim())) {
    throw new ApiError(400, "Fields are required");
  }

  // 2️⃣ Email validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // 3️⃣ Check if user already exists
  const userExist = await User.findOne({ $or: [{ username }, { email }] });
  if (userExist) {
    throw new ApiError(409, "User Already Exist");
  }

  // 4️⃣ Get uploaded files from multer
  const avatarLocalStorage = req.files?.avatar?.[0]?.path || null;
  const coverImageLocalStorage = req.files?.coverImage?.[0]?.path || null;

  if (!avatarLocalStorage) {
    throw new ApiError(400, "Avatar file not received via multer");
  }

  // Convert to absolute paths
  const avatarPath = path.resolve(avatarLocalStorage);
  const coverPath = coverImageLocalStorage ? path.resolve(coverImageLocalStorage) : null;

  // 5️⃣ Upload to Cloudinary
  const avatar = await uploadOnCloudinary(avatarPath);
  const coverImage = coverPath ? await uploadOnCloudinary(coverPath): null;


  if (!avatar || !avatar.url) {
    throw new ApiError(400, "Failed to upload avatar to Cloudinary");
  }

  // 6️⃣ Save user in DB
  const userCreate = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    watchHistory: [] // initialize as empty
  });

  const currentUser = await User.findById(userCreate._id).select(
    "-password -refreshToken"
  );

  if (!currentUser) {
    throw new ApiError(500, "Something went wrong on server-side");
  }

  // ✅ Final Response
  res
    .status(201)
    .json(new ApiResponse(201, currentUser, "User Registered Successfully"));
});


// Login user 
const loginUser = asyncHandler(async (req, res) => { 
  // get form data
  const { username, email, password } = req.body;

   //check validation 
  if (!username && !email) {
  throw new ApiError(400, "Username or email is required");
}


  if (!password) {
  throw new ApiError(400, "Password is required");
}


  //check login data
  const user = await User.findOne({
    $or: [{username},{email}]
  })

  if(!user) {
    throw new ApiError(404,"User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid) {
    throw new ApiError(401,"Password is not valid");
  }

  // access token and refresh token
const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

const LoggedUser = await User.findById(user._id).select("-password -refreshToken");

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production"
};


return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200,{ 
      user: LoggedUser, accessToken, refreshToken
    }, "User LoggedIn Successfully"));

});

const logOutUser = asyncHandler(async(req,res)=>{
  const user  = await User.findByIdAndUpdate(req.user._id, 
    {
      $set: {refreshToken: undefined}
    },
    {
      new: true
    }
  )

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production"
};


return  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "User Logout Successfully"));


})


const refreshAccessToken = asyncHandler(async(req, res)=>{

 const incomingRefreshToken =  req.cookies?.refreshToken || req.body?.refreshToken;

 if (incomingRefreshToken) {
   throw new ApiError(401, "Invalid Token")
 }

 try {
  const decodedata  = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
 
  const user = await User.findById(decodedata?._id)
 
  if (user) {
   throw new ApiError(401,"Refresh Token expired")
  }
 
 const {accessToken, newrefreshToken} = await generateAccessAndRefreshToken(user._id);
 
 const options = {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production"
 };
 
 return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newrefreshToken, options)
     .json(new ApiResponse(200,{ 
     accessToken, refreshToken: newrefreshToken
     }, "Access Token Refreshed"));  

 } catch (error) {
  throw new ApiError(401, error?.message || "Invalid Refresh Access Token")
 }

})

export {
registerUser,
loginUser,
logOutUser,
refreshAccessToken

};

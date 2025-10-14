import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema({
    username : {
        type : String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true

    },
    email: {
        type: String,
        required: true,
        lowercase:true,
        trim:true,
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
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }

},
{
    timestamps: true
}
)

userSchema.pre("save", async function (next) {
    if(this.isModified("password")) return next();

    this.password = await  bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
    jwt.sign(
        {
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRETE,
    {
        expireIN:process.env.ACCESS_TOKEN_EXPIRY
    }
)
    
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
         {
        _id: this._id
    },
    process.env.RERESH_ACCESS_TOKEN,
    {
        expireIN:process.env.RERESH_ACCESS_EXPIRY
    }
    )
}

export const User = mongoose.model("User", userSchema)
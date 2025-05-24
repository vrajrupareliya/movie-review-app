import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const userSchema = new Schema({

         username:{
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            index: true,
            trim: true,
        },
        email:{
            type: String,
            require: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
       fullname:{
            type: String,
            require: true,           
            trim: true,
            index: true, 
        },
        password:{
            type: String,
            require: [true, 'paasword is required']
        },
        avatar:{
            type: String,
            require: true,
        },
        
        coverImage:{
            type: String,
        },

        refreshToken:{
            type: String
        }
    
    },
{
    timestamps: true
}
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password"))  return next();
    
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            _email: this._email,
            _username: this._username,
            _fullname: this._fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },

        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        },
    )
}


export const User =  mongoose.model("User", userSchema)
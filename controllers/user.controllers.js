import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js" 
import { User } from "../models/user.models.js";
import { uplodeoncloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessandRefrshToken = (async(userId) => {

        try {
              const user = await User.findById(userId)
              const accessToken = user.generateAccessToken()
              const refreshToken = user.generateRefreshToken()
              
              //const tokenn = generateAccessToken(userId);
              //console.log("Generated Token:", tokenn); // Log the token



              user.refreshToken = refreshToken
              await user.save({validateBeforeSave: false})
              return {accessToken, refreshToken}


            } catch (error) {
            throw new ApiError(500," something went wrong while generating access and refresh token")
        }

})

 const registerUser = asynchandler(async(req, res) => {

        //get user details
        //check user has apropiate details
        //check : is user already existed[username, email]
        //check user avatar images        
        //upload themm on cloudinary // avtar
        // creat user object , crea user entry in db
        // remove password and refreshtoken field from reponse

    const {fullname, email, username, password,} = req.body
    console.log("email:", email);

    if (
        [fullname, email ,username ,password].some((fields) => fields?.trim === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

  const existedUser = await User.findOne({
        $or: [{username}, {email}]
   })

   if (existedUser) {
        throw new ApiError(409, "Username or Email existed")
   }

   const avatarlocalpath = req.files?.avatar[0]?.path;
   //const coverImagelocalpath = req.files?.coverImage[0]?.path;
   
   let coverImagelocalpath;
   if (req.files && Array.isArray(req.files.coverImage) && req.fields.coverImage.lenght > 0) {
      coverImagelocalpath = req.files.coverImage[0].path
   }

   console.log(":", req.files);

   if (!avatarlocalpath) {
        throw new ApiError(400, "avatar file is reqiured")
   }


  const avatar = await uplodeoncloudinary(avatarlocalpath)
  const coverImage = await uplodeoncloudinary(coverImagelocalpath)

  if (!avatar) {
        throw new ApiError(400, "avatar filed is reqired")
  }

  const user =await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  
})
console.log("User:", user);

const createdUser = await User.findById(user._id).select("-password -refreshToken")
  if (!createdUser) {
     throw new ApiError(500, "something went wrong while registering user")
  }

  return res.status(201).json(
        new ApiResponse(200, createdUser ,"user Registerd Successfully ")
  )
})

const loginUser = asynchandler(async(req, res) => {

  // take data from req.body
  // login via username or email
  // find user
  // check password
  // accees and refresh token
  // send cookies

  const {username, email ,password} = req.body

  if (!username && !email) {
     throw new ApiError(401, "username or password are reqired")
  }
  
 const user = await User.findOne({
    $or: [{username}, {email}]
  })

if (!user) {
  throw new ApiError(404,"user does not exist")
}

const validpassword = await user.isPasswordCorrect(password)

  if (!validpassword) {
    throw new ApiError(402, "invalid user credencials")
  }

  const{accessToken, refreshToken} = await generateAccessandRefrshToken(user._id)

  const loginUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)  
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,{
          user: loginUser, accessToken, refreshToken
        },
      "user loggedin sucessfully"
    )
)
})

const logoutUser = asynchandler(async(req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken: undefined
        }
      },
      {
        new:true
      },
    )
    const options = {
      httpOnly: true,
      secure: true
    }
    return res
  .status(200)  
  .cookie("accessToken", options)
  .cookie("refreshToken", options)
  .json(
    new ApiResponse(200,{},"user logout sucessfully")
)
    
})
  

export {
  registerUser,
  loginUser,
  logoutUser
}

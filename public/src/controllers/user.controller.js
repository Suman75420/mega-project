import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

const generateAccessAndRefreshTokens = async(userid) => {
  try {
   const user = await User.findById(userid)
   const accessToken = user.generateAccessToken()
   const refreshToken = user.
   generateRefreshToken()

   user.refreshToken = refreshToken
   await user.save({ validateBeforeSave : false})

   return {accessToken , refreshToken}

  }
  catch (error) {
     throw new ApiError(500,"Something went wrong while generating refresh and acces token ")
  }
}

const registerUser = asyncHandler( async (req,res) => {
  
// get user deatails from frontend
// validation - not empty
// check if user already exists : username , email
// check for images,check for avatar
// upload them to cloudinary,avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res 

  const  { fullName,email,username,password} = req.body
 //console.log("email : ", email);
 // console.log("req-body " ,req.body);

// if(fullName === ""){
//      throw new ApiError(400 ,"fullname is required"); 
//}
  
  if( 
    [fullName,email,username,password].some((field) => field?.trim() === "")
    ) 
    {
     throw new ApiError(400, "All fields are required");
    }

   const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    console.log("🟡 Avatar path from multer:", avatarLocalPath);
console.log("🟡 File exists:", fs.existsSync(avatarLocalPath));


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if (!avatar) {
        throw new ApiError(500, "failed to upload avatar to cloudinary");
    }
    
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

   let coverImage;
     if(coverImageLocalPath){
      coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if(!coverImage){
        console.warn("failed to upload cover image to cloudinary");
      }
    }
console.log("🟢 Cloudinary upload result:", avatar);


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    });

// user._id field mongoose automatically add krta hai
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )

    if(!createdUser){
    throw new ApiError(500,"something went wrong while registering the user")
   }

    return res.status(201).json(
       new ApiResponse(200,createdUser,"User registered successfully")
    )


    })


const loginUser = asyncHandler(async (req,res) => {
   // get data from the user & store it in var
   //check the username or password is equal to username==useraname && password == password
   // if yes then perform action 
   // call mongodb to check that username or password is present or not if not then throw error
   //if username and email is present then get its id and store var in it
   //retrieve username & password  from that var & then check both are same or not if same then redirect to page that want if not throw error 


   //req.body - data,username or email,find user,password check,access & refresh token,send cookie

   const { email, username,password} = req.body
   console.log('received:' ,req.body);
   
   
  if (typeof username !== 'string' && typeof email !== 'string') {
  throw new ApiError(400, "username or email is required");
}
  //  if(!username && !email){
  //   throw new ApiError(400,"username or email is required"); 
  //  }

   const user = await  User.findOne({
    $or : [{username} , {email}]
    });
  //console.log(user);

  if (!user){
     throw new ApiError(404,"User does not exist");
  }

  const isPasswordValid  = await user.isPasswordCorrect(password)

  // user jo hmlog banye jisme value rakhe or User jo mongoose se mila 

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials");
  }

  const {accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password - refreshToken")

  const options = {
    httpOnly : true,
    secure : true
  }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken,      options)
   .json(
    new ApiResponse(
       200,
       {
        user :loggedInUser , accessToken,refreshToken
       },
       "User logged in successfully"
    )
   )
    })

const logoutUser = asyncHandler(async (req,res) => {
  await  User.findByIdAndUpdate (
     req.user._id,
     {
      // $set : {
      //   refreshToken : undefined
      // }
      $unset : {
      refreshToken : 1
    }
     },
     {
      new : true
     }
   )
   const options  = {
    httpOnly : true,
    secure : true
   }
   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200, {},"User logged Out"))
})


export { 
    registerUser,
    loginUser,
    logoutUser
 }
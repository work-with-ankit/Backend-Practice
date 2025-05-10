import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import  {uploadonCloudinary} from "../utils/cloudinary.js";
 import {ApiResponses} from "../utils/Apiresponses.js";

const registerUser = asyncHandler(async (req, res, ) => {
    
const {fullname, email, password, username,}= req.body
console.log("email:", email);
// if single single check rkna ho 
//    if(fullname===""){
//     throw new ApiError(400,"fullname is required")
//    }
      
      if([fullname,email.username,password,].some((field)=>
        field?.trim()=== ""
    )){
        throw new ApiError(400, "All field required");
    }
     
    const existedUser =  User.findOne({
        $or : [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "user Email or username already exist");
    }

      const avatarLocalPath = req.files?.avatar[0]?.path;
      const  coverImageLocalPath = req.files?.coverImage[0]?.path;

      if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
      }

       const avatar = await  uploadonCloudinary(avatarLocalPath)
       const coverImage = await uploadonCloudinary(coverImageLocalPath)
          
       if(!avatar){
            throw new ApiError(400, "avatar file is required");
        }

      const user =  await User.Create({
            fullname,
            avatar: avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username:username.toLowerCase(),
        })

       const createdUser =  await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the user")
        }
       
         return res.status(201).json(
            new ApiResponses(200, createdUser, "user Registed succesfully")
         )



})

export {registerUser}; 
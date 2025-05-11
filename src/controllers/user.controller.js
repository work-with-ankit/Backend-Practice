import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import  {uploadonCloudinary} from "../utils/cloudinary.js";
 import {ApiResponses} from "../utils/Apiresponses.js";

 const genrateAccessAndRefreshTokken= async(userId)=>{

    try {
        const user = await User.findById(userId)
     const accessToken=   user.genrateAccessToken()
      const refreshToken=   user.genraterRefreshToken()

      user.refreshToken= refreshToken
       await user.save({validateBeforeSave: false})
       
       return {accessToken,refreshToken}
       
        
    } catch (error) {
        throw new ApiError(401, "Something went wrong while genrate access and refresh tokken");
    }
 }

const registerUser = asyncHandler(async (req, res, ) => {
    
const {fullname, email, password, username,}= req.body
// console.log("email:", email);
// if single single check rkna ho 
//    if(fullname===""){
//     throw new ApiError(400,"fullname is required")
//    }
      
      if([fullname,email.username,password,].some((field)=>
        field?.trim()=== ""
    )){
        throw new ApiError(400, "All field required");
    }
     
    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409, "user Email or username already exist");
    }
    //  console.log(req.files)

      const avatarLocalPath = req.files?.avatar[0]?.path;
    //   const  coverImageLocalPath = req.files?.coverImage[0]?.path;
      let coverImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage) 
        && req.files.coverImage.length > 0){
        coverImageLocalPath = req .files.coverImage[0].path     
        } 
           

      if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
      }

       const avatar = await  uploadonCloudinary(avatarLocalPath)
       const coverImage = await uploadonCloudinary(coverImageLocalPath)
          
       if(!avatar){
            throw new ApiError(400, "avatar file is required");
        }

      const user =  await User.create({
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



});

const loginUser = asyncHandler(async(req, res)=>{

    const {email,username, password}= req.body

    if(!username || !email){
        throw new ApiError(400, "Username or email is required");
    }

     const user =  await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(400, "User not register ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
     
    if(!isPasswordValid){
        throw new ApiError(401, "Password  invalid")
    }

     const{ accessToken, refreshToken}=  await genrateAccessAndRefreshTokken(user_id)

     const loggedInUser= await User.findById(user._id).
     select("-password -refreshToken")

     const option={
        httpOnly: true,
        secure:true
     }

     return res.status(200)
     .cookie("accessToken",accessToken, option)
     .cookie("refreshToken", refreshToken,option)
     .json(
        new ApiResponses(
            200, 
            {
                user:loggedInUser, accessToken,
                refreshToken
            },
            "LoggedInUser Successfully"       
        )
     )
});

const logoutUser = asyncHandler(async(req,res)=>{

    await  req.user.findById(
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new: true
        }
    )
    const option={
        httpOnly: true,
        secure:true
     }

     return res.status(200)
     .clearCookie("accessToken", option)
     .clearCookie("refreshToken", option)
     .json(new ApiResponses(200, {}, "user logged out"))

})

export {registerUser,loginUser,logoutUser}; 
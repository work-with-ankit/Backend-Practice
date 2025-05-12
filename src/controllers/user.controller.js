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
      
      if([fullname,email,username,password,].some((field)=>
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

    if(!username && !email){
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

     const{ accessToken, refreshToken}=  await genrateAccessAndRefreshTokken(user._id)

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

    await  User.findByIdAndUpdate(
        req.user._id,
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

const refreshAccessToken= asyncHandler(async(req, res)=>{
    const incomingRefreshToken= req.cookie.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request");
    }

      try {
        const decodeToken=  jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
      const user=  await User.findById(decodeToken?._id)
  
      if(!user){
          throw new ApiError(400, "Invalid refresh token")
      }
  
      if(incomingRefreshToken !==user?.refreshToken){
          throw new ApiError(401, "Invalid Refresh Token")
      }
  
      const options={
          httpOnly:true,
          secure:true
      }
  
      const { accessToken, newrRefreshToken}= await genrateAccessAndRefreshTokken(user._id)
  
      return res
      .send(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newrRefreshToken,options )
      .json(
          new ApiResponses(200,
              {accessToken, refreshToken:newrRefreshToken},
              "Access Token Refresh"
           )
      )
      } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh Token")
        
      }
})

const changeCurrentPassword= asyncHandler(async(req, res)=>{
    const user= await User.findById(req.user?._id)
     const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)

     if(!isPasswordCorrect){
        throw new ApiError(400, "Password is invalid")
     }

     user.password= newPassword
     await user.save({validateBeforeSave:false})

     return res.status(200)
     .json(new ApiResponses(200, {}, "Password change succesfully"));
})

const getCurrentUser = asyncHandler(async(req ,res)=>{
    res.status (200)
    .json(200, req.user, "current User fetch Successfully")
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullname, email}=  req.body

    if(!fullname || email ){
        throw new ApiError(400, "Alln Field are requried")
    }

    const user= User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullname,
                email:email
            }
        },
        {new : true}

    ).select("-password")

    return  res.status(200)
    .json(new ApiResponses(200, user , "Accound Detail Succesfully "))

    
    
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
      const avatarLocalPath = req.file?.path

      if(!updateUserAvatar){
        throw new ApiError(400, "Avatar file is missing ")
      }

      const avatar=  await uploadonCloudinary(avatarLocalPath)

      if(!avatar.url){
        throw new ApiError(400, "Error While uploading on Avatar")
        }

         const  user = await User.findByIdAndUpdate(req.user?._id,
            {
                $set:{
                    avatar:avatar.url
                }
            },{new: true}
        ).select("-password")
       
        return res
        .status (200 )
        .json(new ApiResponses(200, user, "avatar  Image updated succesfully ") )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
      const coverImageLocalPath = req.file?.path

      if(!coverImageLocalPath){
        throw new ApiError(400, "Cover file is misssing  file is missing ")
      }

      const coverImage=  await uploadonCloudinary(coverImageLocalPath)

      if(!coverImage.url){
        throw new ApiError(400, "Error While uploading on Avatar")
        }

        const user =  await User.findByIdAndUpdate(req.user?._id,
            {
                $set:{
                    coverImage:coverImage.url
                }
            },{new: true}
        ).select("-password")

        return res
        .status (200 )
        .json(new ApiResponses(200, user, "cover Image updated succesfully ") )
})

export 
   {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}; 
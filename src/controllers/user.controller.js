import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async(req, res, next) => {
    // res.status(200).json({
    //     message: 'chai aur code'
    // })
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field froom response
    // check for user creation
    // return res

    const { email, fullName, userName, password } = req.body;

    if ([email, fullName, userName, password].some( field => field?.trim() === "")) {
        throw new ApiError( 400, "All fields are reuired")
    }

    const existedUser = User.findOne({
        $or: [ {userName}, {email}]
    });
    console.log('existedUser', existedUser)

    if(existedUser) {
        throw new ApiError(409, "USer already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImagePath[0]?.path;


    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is reuired")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is reuired")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url ?? "",
        email,
        password,
        username: userName.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
} )


export  {registerUser};
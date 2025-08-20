import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit: number = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if ( !userId ){
        throw new ApiError(400, "User not available")
    }

    const video = await Video.find( { owner: userId})
    const videos = await Video.aggregate(
        [
            {
              $match: {
                owner: new mongoose.Types.ObjectId(userId)
              }
            }
           
            
          ]
    );


    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                page,
                videos
            }
        ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body
    // TODO: get video, upload to cloudinary, create video
    

    if(!title || !description) {
        throw new ApiError(400, 'All fields required')
    }

    let videoFileLocalPath;

    if( req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileLocalPath = req.files.videoFile[0].path;
    }


    if(!videoFileLocalPath) {
        throw new ApiError(400, "Video file is reqired")
    }

    let thumbNailLocalPath;

    if( req.files && Array.isArray(req.files.thumbNail) && req.files.thumbNail.length > 0) {
        thumbNailLocalPath = req.files.videoFile[0].path;
    }

    if(!thumbNailLocalPath) {
        throw new ApiError(400, "Thumb nail is reqired")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbNail = await uploadOnCloudinary(thumbNailLocalPath);
    const owner = req.user;

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile?.url,
        thumbNail: thumbNail?.url,
        duration,
        owner
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video has been uploaded successfully")
        )
    
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId) {
        throw new ApiError(400, 'No video with this videoid is available')
    }

    const video = await Video.findById(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId) {
        throw new ApiError(400, "video not found")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                description: "my marriage video has been updated",
                title: "updated marraiage video",
            }
        },
        { new: true }
    )


    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video has been updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if ( !videoId ){
        throw new ApiError(400, "Video not available")
    }

    const video = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video has been deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if ( !videoId ){
        throw new ApiError(400, "Video not available")
    }

    const video = await Video.aggregate(
        [
            {
                $match: {
                  _id: new mongoose.Types.ObjectId(videoId)
                  
                }
            },
            {
               $set: {
                 isPublished: {
                   $cond: {
                        if: {$eq: [true, '$isPublished']},
                        then: false,
                        else: true
                   }
            
                 }
               }
            }
        ]
    )


    return res
        .status(200)
        .json(new ApiResponse(200, video, "Publish status has been updated"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
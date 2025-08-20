import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    console.log(req.user._id)
    const { content } = req.body;

    if(!content) {
        throw new ApiError(400, "Tweet content is required.")
    }

    const tweet = await Tweet.create( {
        content,
        owner: req.user
    })

    if(!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweet has been created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if(!userId) {
        throw new ApiError(400, "UserId is required")
    }
    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $project: {
                content: 1
            }
        }
    ]);

    if(!tweets.length) {
        throw new ApiError(500, "Failed to find the tweets")
    }

    return res.status(200).json(new ApiResponse(200, tweets, "User tweets fetched"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if(!tweetId) {
        throw new ApiError(400, "Tweet id is not provided")
    }

    if(!content) {
        throw new ApiError(400, "No content to update is provided");
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, { content } );

    return res.status(200).json(new ApiResponse(200, tweet, "your tweet has been updated"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if(!tweetId) {
        throw new ApiError(400, "Tweet id is not provided")
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200, {}, "Tweet has been deleted"))


})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
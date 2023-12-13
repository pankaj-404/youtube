import { Schema, model } from "mongoose";
import mongooseAggregatePaginateV2 from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema({
    videoFile: {
        type: String,
        required: [true, "Video file is required."],
    },
    thumbnail: {
        type: String,
        required: [true, "Thumbnail is required."],
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    title: {
        type: String,
        required: [true, "Title is required."],
    },
    description: {
        type: String,
        required: [true, "Description is required."],
    },
    duration: {
        type: Number,
        required: [true, "Duration is required."],
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginateV2)

export const Video = model("Video", videoSchema)
import { DessertIcon, Type } from "lucide-react";
import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const videoSchema = new Schema({
    videoFile: {
        Type: String,
        required: true
    },
    thumbnail: {
        Type: String,
        required: true
    },
     title: {
        Type: String,
        required: true
    },
     description: {
        Type: String,
        required: true
    },
     thumbnail: {
        Type: String,
        required: true
    },
     duration: {
        Type: Number,
        required: true
    },
     views: {
        Type: Number,
        default: 0
    },
    isPublished: {
        Type: Boolean,
        default: true
    },
    owner: {
        Type: Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps: true
}
)
videoSchema.plugin(mongoosePaginate);

export const Video = mongoose.model("Video", videoSchema)
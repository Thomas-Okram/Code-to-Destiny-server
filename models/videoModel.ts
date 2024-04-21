import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true
    },
    description:{
        type:String,
        trim:true,
    },
    courseId:{
        type:String,
        required:true
    },
    videoUrl:{
        type:String,
        trim:true,
        required:true
    },
    filename:{
        type:String,
        trim:true,
    }
},{timestamps:true});

export default mongoose.model("CourseVideos",videoSchema)
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const videoSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
    },
    courseId: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        trim: true,
        required: true
    },
    filename: {
        type: String,
        trim: true,
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model("CourseVideos", videoSchema);

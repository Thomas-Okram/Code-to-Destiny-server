"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourseVideo = exports.getCourseVideo = exports.getAllCourseVideos = exports.addVideo = exports.generateVideoUrl = exports.deleteCourse = exports.getAdminAllCourses = exports.addReplyToReview = exports.addReview = exports.addAnwser = exports.addQuestion = exports.getCourseByUser = exports.getAllCourses = exports.getSingleCourse = exports.editCourse = exports.uploadCourse = void 0;
const catchAsyncErrors_1 = require("../middleware/catchAsyncErrors");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const course_service_1 = require("../services/course.service");
const course_model_1 = __importDefault(require("../models/course.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const redis_1 = require("../utils/redis");
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const notification_Model_1 = __importDefault(require("../models/notification.Model"));
const axios_1 = __importDefault(require("axios"));
const videoModel_1 = __importDefault(require("../models/videoModel"));
// upload course
exports.uploadCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        console.log(data);
        // if(data == {}){
        //   return next(new ErrorHandler("no course data amigo", 500));
        // }
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        data.courseData = data.courseData.map((c) => {
            // Create a new object without the 'video' property
            const { video, ...updatedItem } = c;
            return updatedItem;
        });
        const course = await course_model_1.default.create(data);
        console.log("course", course);
        // if(!data.courseData[0].video){
        //   return next(new ErrorHandler("Course creation failed,some sections have no video!", 500));
        // }
        if (course) {
            async function uploadDemoVideo() {
                const blob = new Blob([data.demoVideo]);
                const file = new File([blob], data.name);
                const formData = new FormData();
                formData.append('video', file);
                // Make sure to send the request with the FormData object
                formData.append('title', data.name || "");
                formData.append('description', data.description || "");
                formData.append('courseId', course._id || "");
                console.log("formdata", formData);
                const response = await axios_1.default.post('/upload-course-video', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                course.demoVideo = response.data?.videoUrl;
            }
            //   data.courseData.map(async(c: any) => {
            //     //make a post request to /upload-course-video route to upload video
            //     const { video, ...remainingItem } = c;
            //     // const formData = new FormData();
            //     // formData.append('video', video);
            //     video.append('title', c.title || "");
            //     video.append('description', c.description || "");
            //     video.append('courseId', course._id || "");
            //     const response = await axios.post('/upload-course-video', video, {
            //         headers: {
            //           'Content-Type': 'multipart/form-data'
            //         }
            //     });
            //  const courseObject = course?.courseData.find((co: any) => co?.title === c?.title)
            //  if(courseObject){
            //   courseObject.videoUrl = response.data?.videoUrl || ""
            //  }
            //  await course.save();
            //   }); 
        }
        if (!course) {
            return next(new ErrorHandler_1.default("Course creation failed", 500));
        }
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// edit course
exports.editCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        const courseId = req.params.id;
        const courseData = (await course_model_1.default.findById(courseId));
        if (thumbnail && !thumbnail.startsWith("https")) {
            await cloudinary_1.default.v2.uploader.destroy(courseData.thumbnail.public_id);
            const myCloud = await cloudinary_1.default.v2.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (thumbnail.startsWith("https")) {
            data.thumbnail = {
                public_id: courseData?.thumbnail.public_id,
                url: courseData?.thumbnail.url,
            };
        }
        const course = await course_model_1.default.findByIdAndUpdate(courseId, {
            $set: data,
        }, { new: true });
        res.status(201).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get single course --- without purchasing
exports.getSingleCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courseId = req.params.id;
        console.log(courseId);
        const isCacheExist = await redis_1.redis.get(courseId);
        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course,
            });
        }
        else {
            const course = await course_model_1.default.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
            await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
            res.status(200).json({
                success: true,
                course,
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all courses --- without purchasing
exports.getAllCourses = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const courses = await course_model_1.default.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get course content -- only for valid user
exports.getCourseByUser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = await user_model_1.default
            .findById(req.user?._id)
            .select("courses");
        const courseId = req.params.id;
        console.log("courseList", userCourseList);
        const courseExists = userCourseList?.courses.find((course) => {
            if (courseId.match(/^[0-9a-fA-F]{24}$/)) {
                return course?.courseId.toString() === courseId;
            }
            else {
                return course?.courseId === courseId;
            }
        });
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 401));
        }
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const content = course?.courseData;
        res.status(200).json({
            success: true,
            content,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addQuestion = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const couseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!couseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        // create a new question object
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        // add this question to our course content
        couseContent.questions.push(newQuestion);
        await notification_Model_1.default.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `You have a new question in ${couseContent.title}`,
        });
        // save the updated course
        await course?.save();
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addAnwser = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!mongoose_1.default.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const couseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!couseContent) {
            return next(new ErrorHandler_1.default("Invalid content id", 400));
        }
        const question = couseContent?.questions?.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler_1.default("Invalid question id", 400));
        }
        // create a new answer object
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        // add this answer to our course content
        question.questionReplies.push(newAnswer);
        await course?.save();
        if (req.user?._id === question.user._id) {
            // create a notification
            await notification_Model_1.default.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `You have a new question reply in ${couseContent.title}`,
            });
        }
        else {
            const data = {
                name: question.user.name,
                title: couseContent.title,
            };
            const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, "../mails/question-reply.ejs"), data);
            try {
                await (0, sendMail_1.default)({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });
            }
            catch (error) {
                return next(new ErrorHandler_1.default(error.message, 500));
            }
        }
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReview = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;
        // check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList?.some((course) => course.courseId.toString() === courseId.toString());
        if (!courseExists) {
            return next(new ErrorHandler_1.default("You are not eligible to access this course", 404));
        }
        const course = await course_model_1.default.findById(courseId);
        const { review, rating } = req.body;
        const reviewData = {
            user: req.user,
            rating,
            comment: review,
        };
        course?.reviews.push(reviewData);
        let avg = 0;
        course?.reviews.forEach((rev) => {
            avg += rev.rating;
        });
        if (course) {
            course.ratings = avg / course.reviews.length; // one example we have 2 reviews one is 5 another one is 4 so math working like this = 9 / 2  = 4.5 ratings
        }
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        // create notification
        await notification_Model_1.default.create({
            user: req.user?._id,
            title: "New Review Received",
            message: `${req.user?.name} has given a review in ${course?.name}`,
        });
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
exports.addReplyToReview = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await course_model_1.default.findById(courseId);
        if (!course) {
            return next(new ErrorHandler_1.default("Course not found", 404));
        }
        const review = course?.reviews?.find((rev) => rev._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler_1.default("Review not found", 404));
        }
        const replyData = {
            user: req.user,
            comment,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies?.push(replyData);
        await course?.save();
        await redis_1.redis.set(courseId, JSON.stringify(course), "EX", 604800); // 7days
        res.status(200).json({
            success: true,
            course,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
});
// get all courses --- only for admin
exports.getAdminAllCourses = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        (0, course_service_1.getAllCoursesService)(res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// Delete Course --- only for admin
exports.deleteCourse = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await course_model_1.default.findById(id);
        if (!course) {
            return next(new ErrorHandler_1.default("course not found", 404));
        }
        await course.deleteOne({ id });
        await redis_1.redis.del(id);
        res.status(200).json({
            success: true,
            message: "course deleted successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
// generate video url
exports.generateVideoUrl = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { videoId } = req.body;
        console.log(req.body);
        const response = await axios_1.default.post(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, { ttl: 300 }, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
            },
        });
        res.json(response.data);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.addVideo = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { title, description, courseId } = req.body;
        if (req.file) {
            const video = new videoModel_1.default({
                title,
                description,
                courseId,
                filename: req.file.filename,
                videoUrl: req.file.path,
            });
            await video.save();
            res.status(200).json({
                success: true,
                message: "Video uploaded successfully",
                video,
            });
            console.log(req.file.filename, "uploaded successfully");
        }
        if (!req.file) {
            res.status(404).json({
                success: false,
                message: "no file found",
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.getAllCourseVideos = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const videos = await videoModel_1.default.find();
        res.status(200).json({
            success: true,
            videos,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.getCourseVideo = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const videos = await videoModel_1.default.find({ courseId: courseId });
        //  console.log(videos);
        res.status(200).json({
            success: true,
            videos,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});
exports.deleteCourseVideo = (0, catchAsyncErrors_1.CatchAsyncError)(async (req, res, next) => {
    try {
        const { id, fileName } = req.params;
        const video = await videoModel_1.default.findById(id);
        if (!video) {
            return next(new ErrorHandler_1.default("Video not found", 404));
        }
        // Delete the file using fs.unlink
        const filePath = path_1.default.join(__dirname, '../public/videos', fileName);
        console.log("deleteinng", filePath);
        fs_1.default.unlink(filePath, async (err) => {
            if (err) {
                return next(new ErrorHandler_1.default("Error deleting video file", 500));
            }
            // Delete the video document from the database
            await video.deleteOne({ id });
            // Delete from redis
            // await redis.del(id);
            res.status(200).json({
                success: true,
                message: "Video deleted successfully",
            });
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
});

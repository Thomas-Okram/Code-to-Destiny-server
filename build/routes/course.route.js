"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_controller_1 = require("../controllers/course.controller");
const auth_1 = require("../middleware/auth");
const videoUpload_1 = require("../middleware/videoUpload");
const courseRouter = express_1.default.Router();
courseRouter.post("/create-course", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), course_controller_1.uploadCourse);
courseRouter.put("/edit-course/:id", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), course_controller_1.editCourse);
courseRouter.get("/get-course/:id", course_controller_1.getSingleCourse);
courseRouter.get("/get-courses", course_controller_1.getAllCourses);
courseRouter.get("/get-admin-courses", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), course_controller_1.getAdminAllCourses);
courseRouter.get("/get-course-content/:id", auth_1.isAutheticated, course_controller_1.getCourseByUser);
courseRouter.put("/add-question", auth_1.isAutheticated, course_controller_1.addQuestion);
courseRouter.put("/add-answer", auth_1.isAutheticated, course_controller_1.addAnwser);
courseRouter.put("/add-review/:id", auth_1.isAutheticated, course_controller_1.addReview);
courseRouter.put("/add-reply", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), course_controller_1.addReplyToReview);
courseRouter.post("/getVdoCipherOTP", course_controller_1.generateVideoUrl);
courseRouter.delete("/delete-course/:id", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), course_controller_1.deleteCourse);
//remeber to add isAuthenticated and admin only middlewares here
courseRouter.post("/upload-course-video", videoUpload_1.videoUpload.single("video"), course_controller_1.addVideo);
courseRouter.get("/get-videos", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), course_controller_1.getAllCourseVideos);
courseRouter.get("/get-course-video/:courseId", course_controller_1.getCourseVideo);
courseRouter.delete("/delete-course-video/:id/:fileName", auth_1.isAutheticated, (0, auth_1.authorizeRoles)("admin"), course_controller_1.deleteCourseVideo);
exports.default = courseRouter;

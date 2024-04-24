import express from "express";
import {
  addAnwser,
  addQuestion,
  addReplyToReview,
  addReview,
  addVideo,
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAdminAllCourses,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
  getCourseVideo,
  getAllCourseVideos,
  deleteCourseVideo
} from "../controllers/course.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { videoUpload } from "../middleware/videoUpload";
const courseRouter = express.Router();

courseRouter.post(
  "/create-course",
  isAutheticated,
  authorizeRoles("admin"),
  uploadCourse
);

courseRouter.put(
  "/edit-course/:id",
  isAutheticated,
  authorizeRoles("admin"),
  editCourse
);

courseRouter.get("/get-course/:id", getSingleCourse);

courseRouter.get("/get-courses", getAllCourses);

courseRouter.get(
  "/get-admin-courses",
  isAutheticated,
  authorizeRoles("admin"),
  getAdminAllCourses
);

courseRouter.get("/get-course-content/:id", isAutheticated, getCourseByUser);

courseRouter.put("/add-question", isAutheticated, addQuestion);

courseRouter.put("/add-answer", isAutheticated, addAnwser);

courseRouter.put("/add-review/:id", isAutheticated, addReview);

courseRouter.put(
  "/add-reply",
  isAutheticated,
  authorizeRoles("admin"),
  addReplyToReview
);

courseRouter.post("/getVdoCipherOTP", generateVideoUrl);

courseRouter.delete(
  "/delete-course/:id",
  isAutheticated,
  authorizeRoles("admin"),
  deleteCourse
);

//remeber to add isAuthenticated and admin only middlewares here
courseRouter.post("/upload-course-video", videoUpload.single("video"),addVideo)
courseRouter.get("/get-videos",  isAutheticated,authorizeRoles("admin"),getAllCourseVideos)
courseRouter.get("/get-course-video/:courseId",getCourseVideo)
courseRouter.delete("/delete-course-video/:id/:fileName",isAutheticated,authorizeRoles("admin"),deleteCourseVideo)

export default courseRouter;

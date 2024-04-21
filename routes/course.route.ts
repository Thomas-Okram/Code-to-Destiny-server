import express from "express";
import {
  addAnwser,
  addQuestion,
  addReplyToReview,
  addReview,
<<<<<<< HEAD
  addVideo,
=======
>>>>>>> 1cdd9a5265933a6f25aa5d7235e2f231363029da
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAdminAllCourses,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
<<<<<<< HEAD
  getCourseVideo
} from "../controllers/course.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { videoUpload } from "../middleware/videoUpload";
=======
} from "../controllers/course.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
>>>>>>> 1cdd9a5265933a6f25aa5d7235e2f231363029da
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
courseRouter.get("/get-course-video/:courseId",getCourseVideo)

export default courseRouter;

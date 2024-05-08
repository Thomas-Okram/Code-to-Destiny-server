require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";
import { rateLimit } from "express-rate-limit";
import path from "path";

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

app.use('/public',express.static(path.join(__dirname,'public')))

// // cors => cross origin resource sharing
// app.use(
//   cors({
//     origin: ["https://code-to-destiny-client-seven.vercel.app/"],
//     credentials: true,
//   })
// );

// Apply CORS middleware before defining any routes
app.use(
  cors({
    origin: ['code-to-destiny.vercel.app',"https://code-to-destiny-git-master-aww2ers-projects.vercel.app","https://code-to-destiny-prmyhgq6l-aww2ers-projects.vercel.app","https://code-to-destiny.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // If your client application sends credentials (e.g., cookies), set this to true
  })
);

// api requests limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// routes
app.use(
  "/api/v1",
  userRouter,
  orderRouter,
  courseRouter,
  notificationRouter,
  analyticsRouter,
  layoutRouter
);

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    succcess: true,
    message: "API is working",
  });
});

// unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// middleware calls
app.use(limiter);
app.use(ErrorMiddleware);

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
import fetch from "node-fetch"; // Import node-fetch for making HTTP requests

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors => cross origin resource sharing
app.use(
  cors({
    origin: ["https://code-to-destiny-client-seven.vercel.app/"],
    credentials: true,
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
app.post("/test", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Define the URL you want to POST to
    const url = "https://example.com/your-endpoint";

    // Data to be sent in the request body
    const postData = {
      // Your data here
    };

    // Options for the fetch request
    const options = {
      method: "POST",
      mode: "no-cors", // Setting mode to 'no-cors'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    };

    // Make the POST request
    const response = await fetch(url, options);

    // Handle the response
    // For example, you can send back the response status and data
    res.status(response.status).json({ data: await response.json() });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

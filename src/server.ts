/** Node modules */
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";

/** Types */
import type { CorsOptions } from "cors";

/** Custom modules */
import config from "@/config";
import limiter from "@/lib/express_rate_limit";

/** Initial express app */
const app = express();

/** Config CORS options */
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (config.NODE_ENV === "development" || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: ${origin} is not allowed by CORS`), false);
    }
  },
};

/** Middlewares */
app.use(cors(corsOptions)); /* CORS middleware */
app.use(express.json()); /* Enable JSON request body parsing */
app.use(express.urlencoded({ extended: true })); /* Request body parsing with extended mode */
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024,
  }),
); /* Enable response compression to reduce payload size and improve performance */
app.use(helmet()); /* enhance security by setting various HTTP headers */
app.use(limiter); /* Rate limit middleware to prevent excessive requests and enhance security */

/** Initial routes */
app.get("/", (req, res) => {
  res.json({
    message: "Hello from backend",
  });
});

/** Run the server */
app.listen(config.PORT, () => console.log(`Server running on http://localhost:${config.PORT}`));

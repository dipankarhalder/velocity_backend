/** Node modules */
import { Router } from "express";

const router = Router();

/** Root router */
router.get("/", (req, res) => {
  res.status(200).json({
    message: "API Service is live",
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;

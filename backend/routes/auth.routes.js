import express from "express";
import multer from "multer";
import { signIn, signup, registerFace, verifyFace } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/login", signIn);
router.post("/signup", signup);
router.post("/register-face", protect, upload.single("selfie"), registerFace);
router.post("/verify-face", upload.single("selfie"), verifyFace);

export default router;

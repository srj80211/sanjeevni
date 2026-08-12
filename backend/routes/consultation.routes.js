import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { listConsultations, submitConsultation } from "../controllers/consultation.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", listConsultations);
router.post("/", submitConsultation);

export default router;
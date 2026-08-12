import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { getConsultations, createConsultation } from "../services/consultation.service.js";

export const listConsultations = asyncHandler(async (req, res) => {
    const consultations = await getConsultations();
    successResponse(res, 200, { consultations });
});

export const submitConsultation = asyncHandler(async (req, res) => {
    const consultation = await createConsultation({ ...req.body, user: req.user._id });
    successResponse(res, 201, { consultation });
});
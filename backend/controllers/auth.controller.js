import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { Users as User } from "../models/user.model.js";
import { login } from "../services/auth.service.js";
import { getFaceEmbedding, verifyFaceWithDeepFace } from "../services/face.service.js";
import jwt from "jsonwebtoken";

export const signIn = asyncHandler(async (req, res) => {
    const result = await login(req.body);
    successResponse(res, 200, result);
});

// User signup - creates account without face (face registered in separate step)
export const signup = asyncHandler(async (req, res) => {
    const { fullName, mobile, address, aadhar, email, password, villageCode } = req.body;

    // Validate required fields
    if (!fullName || !mobile || !address || !aadhar || !email || !password || !villageCode) {
        throw new AppError("All fields are required", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { aadhar }, { mobile }] });
    if (existingUser) {
        throw new AppError("User already registered with this email, aadhar, or mobile", 400);
    }

    // Create new user (face embedding will be added later)
    const newUser = await User.create({
        fullName,
        mobile,
        address,
        aadhar,
        email,
        password,
        villageCode,
        faceEmbedding: [] // Empty embedding, will be set when face is registered
    });

    // Generate token for the new user
    const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    successResponse(res, 201, {
        token,
        user: {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            mobile: newUser.mobile
        },
        message: "User registered successfully. Please register your face next."
    });
});

// Registers the face embedding for the logged-in user.
export const registerFace = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError("Selfie image is required", 400);
    }

    try {
        const embedding = await getFaceEmbedding(req.file.buffer);
        if (!Array.isArray(embedding) || embedding.length !== 128) {
            throw new AppError("Face embedding is invalid", 400);
        }

        await User.findByIdAndUpdate(req.user.id, { faceEmbedding: embedding.slice(0, 128) });
        successResponse(res, 200, { message: "Face registered successfully" });
    } catch (err) {
        throw new AppError(`Face registration failed: ${err.message}`, 400);
    }
});

// Verifies identity from a selfie using face service
export const verifyFace = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError("Selfie image is required", 400);
    }

    const users = await User.find({}).select("_id faceEmbedding fullName mobile villageCode email");
    const validUsers = users.filter(
        (user) => Array.isArray(user.faceEmbedding) && user.faceEmbedding.length === 128
    );

    if (validUsers.length === 0) {
        return res.status(404).json({
            success: false,
            message: "New Registration Required"
        });
    }

    try {
        const candidates = validUsers.map((user) => ({
            userId: user._id.toString(),
            embedding: user.faceEmbedding
        }));

        const result = await verifyFaceWithDeepFace(req.file.buffer, candidates);

        if (result.match && result.userId) {
            const matchedUser = validUsers.find((user) => user._id.toString() === result.userId);
            if (!matchedUser) {
                throw new AppError("Matched user not found", 404);
            }

            return res.status(200).json({
                success: true,
                message: "Verified",
                data: { user: matchedUser }
            });
        }

        return res.status(404).json({
            success: false,
            message: "Face not recognized. Please try again."
        });
    } catch (err) {
        throw new AppError(`Face verification failed: ${err.message}`, 400);
    }
});

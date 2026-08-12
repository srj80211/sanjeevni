import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Users as User } from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

const signToken = (user) =>
    jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "15m" });

export const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = signToken(user);
    return { token, user };
};

// Finding Euclidean Distance
const calculateDistance = (a, b) =>
    Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));

export const verifyFaceIdentity = async (liveEmbedding) => {
    const users = await User.find({});
    let identifiedUser = null;
    let minDistance = 0.6;

    users.forEach(user => {
        const distance = calculateDistance(liveEmbedding, user.faceEmbedding);
        if (distance < minDistance) {
            minDistance = distance;
            identifiedUser = user;
        }
    });

    return identifiedUser;
};
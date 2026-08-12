import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    aiSummary: {
        type: String,
        required: true
    },
    symptoms: {
        type: [String],
        default: []
    },
    diagnosis: {
        type: String
    },
    medicinesPrescribed: {
        type: [String],
        default: []
    },
    doctorStatus: {
        type: String,
        enum: ["pending", "reviewed", "handed-off"],
        default: "pending"
    },
    esanjeevaniRedirected: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Consultation = mongoose.model("consultation", consultationSchema);
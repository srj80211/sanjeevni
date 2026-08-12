import mongoose from "mongoose";

const ashaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    villageCode: {
        type: String,
        required: true
    },
    assignedUsers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "user",
        default: []
    }
}, { timestamps: true });

export const AshaWorker = mongoose.model("asha", ashaSchema);
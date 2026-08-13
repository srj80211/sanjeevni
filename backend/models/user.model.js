import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobile:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    aadhar:{
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    biometricTemplate: {
        type: String,
        unique: true,
        index: true
    },
    // For Asha worker mapping
    villageCode: {
        type: String,
        required: true
    },
    // Storing the 128-dimension vector from the AI model
    faceEmbedding: {
        type: [Number],
        default: [],
        required: true
    },
    lastConsultation: { type: Date }
},{timestamps:true});

userSchema.pre("save", async function(next){
    const saltRounds = 12;
    if(this.isModified("password")) {
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

export const Users = mongoose.model("user", userSchema);
import { Users as User } from '../models/user.model.js';

export const verifyFaceIdentity = async (req, res) => {
    try{
        const { liveEmbedding } = req.body;

        const users = await User.find({ });

        let identifiedUser = null;
        let minDistance = 0.6;

        users.forEach(user => {
            const distance = calculateDistance(liveEmbedding, user.faceEmbedding);
            if (distance < minDistance) {
                minDistance = distance;
                identifiedUser = user;
            }
        });

        if (identifiedUser) {
            return res.status(200).json({
                status: "Verified",
                user: identifiedUser
            });
        } else {
            return res.status(404).json({
                status: "Not Found",
                message: "New Registration Required"
            });
        }
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// Finding Euclidean Distance
function calculateDistance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}
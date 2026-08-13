import axios from "axios";
import FormData from "form-data";

const PYTHON_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8001";

export const uploadFaceEmbedding = async (faceEmbedding) => {
    if (!faceEmbedding || !Array.isArray(faceEmbedding)) {
        throw new Error("Invalid face embedding provided");
    }
    return faceEmbedding;
};

// Sends a selfie image to the Python face-recognition service and
// returns the 128-dimension embedding vector.
export const getFaceEmbedding = async (imageBuffer) => {
    if (!imageBuffer) {
        throw new Error("Selfie image is required");
    }

    const form = new FormData();
    form.append("image", imageBuffer, { filename: "selfie.jpg" });

    const { data } = await axios.post(`${PYTHON_SERVICE_URL}/embed`, form, {
        headers: form.getHeaders()
    });

    if (!data || !Array.isArray(data.embedding)) {
        throw new Error("Invalid response from face service");
    }

    const embedding = data.embedding.filter((value) => Number.isFinite(value));
    if (embedding.length !== 128) {
        throw new Error("Face embedding must contain exactly 128 values");
    }

    return embedding;
};

const normalizeStoredCandidates = (storedEmbeddings) => {
    if (!Array.isArray(storedEmbeddings) || storedEmbeddings.length === 0) {
        return [];
    }

    return storedEmbeddings
        .map((candidate) => {
            if (Array.isArray(candidate)) {
                const embedding = candidate.filter((value) => Number.isFinite(value));
                if (embedding.length !== 128) {
                    return null;
                }
                return { userId: null, embedding };
            }

            if (candidate && typeof candidate === "object" && Array.isArray(candidate.embedding)) {
                const embedding = candidate.embedding.filter((value) => Number.isFinite(value));
                if (embedding.length !== 128) {
                    return null;
                }
                return {
                    userId: candidate.userId || candidate._id || candidate.id || null,
                    embedding
                };
            }

            return null;
        })
        .filter(Boolean);
};

// Sends a selfie plus the stored embeddings to the Python service, where
// the shop compares them and returns the closest match.
export const verifyFaceWithDeepFace = async (imageBuffer, storedEmbeddings) => {
    const normalizedCandidates = normalizeStoredCandidates(storedEmbeddings);

    if (!imageBuffer || normalizedCandidates.length === 0) {
        throw new Error("Selfie image and valid stored embeddings are required");
    }

    const form = new FormData();
    form.append("image", imageBuffer, { filename: "selfie.jpg" });
    form.append("stored_embeddings", JSON.stringify(normalizedCandidates));

    const { data } = await axios.post(`${PYTHON_SERVICE_URL}/verify`, form, {
        headers: form.getHeaders()
    });

    if (!data || typeof data.match !== "boolean") {
        throw new Error("Invalid response from face service");
    }

    return data;
};
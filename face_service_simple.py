# Face Embedding Service with OpenCV-based face recognition
# Uses detected face ROI + normalized grayscale + gradient features
# Embeddings compared using cosine distance with a tight threshold

import io
import json
from typing import List

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

app = FastAPI(title="Sanjeevni Face Embedding Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DISTANCE_THRESHOLD = 0.08


def _normalize_vector(vec: List[float]) -> List[float]:
    arr = np.asarray(vec, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm < 1e-8:
        fallback = np.linspace(0.1, 1.0, len(arr), dtype=np.float32)
        fallback += (np.arange(len(arr), dtype=np.float32) * 0.01)
        fallback_norm = np.linalg.norm(fallback)
        if fallback_norm < 1e-8:
            return arr.astype(float).tolist()
        return (fallback / fallback_norm).astype(float).tolist()
    return (arr / norm).astype(float).tolist()


def _read_image(data: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        return np.asarray(img, dtype=np.uint8)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}")


def _detect_face(gray: np.ndarray) -> np.ndarray:
    if not hasattr(cv2, "CascadeClassifier"):
        raise HTTPException(
            status_code=400,
            detail="Face detector is not available in this environment. Face verification is disabled for safety.",
        )

    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    cascade = cv2.CascadeClassifier(cascade_path)
    if cascade.empty():
        raise HTTPException(
            status_code=400,
            detail="Face detector model is missing. Face verification is disabled for safety.",
        )

    faces = cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=6,
        minSize=(80, 80),
    )

    if len(faces) == 0:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    x, y, w, h = max(faces, key=lambda box: box[2] * box[3])
    return gray[y : y + h, x : x + w]


def _prepare_face(gray: np.ndarray) -> np.ndarray:
    gray = cv2.equalizeHist(gray)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    face = _detect_face(gray)

    h, w = face.shape
    side = max(h, w)
    canvas = np.zeros((side, side), dtype=np.uint8)
    y_offset = (side - h) // 2
    x_offset = (side - w) // 2
    canvas[y_offset : y_offset + h, x_offset : x_offset + w] = face
    face = cv2.resize(canvas, (128, 128), interpolation=cv2.INTER_AREA)
    return face


def _build_embedding(face: np.ndarray) -> List[float]:
    gray = face.astype(np.float32) / 255.0

    # 64 values: downsampled 8x8 face map
    downsampled = cv2.resize(gray, (8, 8), interpolation=cv2.INTER_AREA).reshape(-1)

    # 32 values: gradient/magnitude histogram
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    magnitude = np.hypot(gx, gy)
    grad_hist, _ = np.histogram(magnitude.ravel(), bins=32, range=(0.0, float(magnitude.max()) + 1e-8))
    grad_hist = grad_hist.astype(np.float32)
    grad_hist = grad_hist / (grad_hist.sum() + 1e-8)

    # 32 values: local mean/std blocks across the face
    block_features = []
    for y in range(0, 128, 32):
        for x in range(0, 128, 32):
            block = gray[y : y + 32, x : x + 32]
            if block.size == 0:
                block_features.extend([0.0, 0.0])
                continue
            block_features.append(float(block.mean()))
            block_features.append(float(block.std()))

    while len(block_features) < 32:
        block_features.append(0.0)
    block_features = block_features[:32]

    embedding = np.concatenate([
        downsampled.reshape(-1),
        grad_hist.reshape(-1),
        np.asarray(block_features, dtype=np.float32),
    ]).astype(np.float32)

    if embedding.shape[0] != 128:
        raise ValueError(f"Embedding should have 128 values, got {embedding.shape[0]}")

    return _normalize_vector(embedding.tolist())


def _cosine_distance(vec_a: List[float], vec_b: List[float]) -> float:
    a = np.asarray(vec_a, dtype=np.float32)
    b = np.asarray(vec_b, dtype=np.float32)
    denom = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denom < 1e-8:
        return 1.0
    return 1.0 - float(np.dot(a, b) / denom)


def find_best_match(live_embedding: List[float], candidates: List[dict]) -> dict:
    """Return the best candidate while ignoring invalid or empty embeddings."""
    best = {
        "match": False,
        "userId": None,
        "index": -1,
        "distance": float("inf"),
    }

    for index, candidate in enumerate(candidates):
        if candidate is None:
            continue

        if isinstance(candidate, dict):
            user_id = candidate.get("userId") or candidate.get("_id") or candidate.get("id")
            embedding = candidate.get("embedding")
        elif isinstance(candidate, list):
            user_id = None
            embedding = candidate
        else:
            continue

        if not isinstance(embedding, list) or len(embedding) != 128:
            continue

        distance = _cosine_distance(live_embedding, embedding)
        if distance < best["distance"]:
            best = {
                "match": False,
                "userId": user_id,
                "index": index,
                "distance": distance,
            }

    best["match"] = best["distance"] <= DISTANCE_THRESHOLD
    return best


@app.get("/")
async def health():
    return {
        "status": "ok",
        "service": "face-embedding",
        "model": "opencv-robust-face-embedding",
        "distance_threshold": DISTANCE_THRESHOLD,
        "note": "Uses detected face crop, grayscale-normalization, gradient histograms, and local block stats",
    }


@app.post("/embed")
async def embed(image: UploadFile = File(...)):
    img = _read_image(await image.read())
    if img.size == 0:
        raise HTTPException(status_code=400, detail="Image is empty")

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    face = _prepare_face(gray)
    embedding = _build_embedding(face)

    return {
        "embedding": embedding,
        "model": "opencv-robust-face-embedding",
        "dimensions": len(embedding),
    }


@app.post("/verify")
async def verify(image: UploadFile = File(...), stored_embeddings: str = Form(...)):
    img = _read_image(await image.read())
    if img.size == 0:
        raise HTTPException(status_code=400, detail="Image is empty")

    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    face = _prepare_face(gray)
    live_embedding = _build_embedding(face)

    try:
        stored = json.loads(stored_embeddings)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="stored_embeddings must be valid JSON")

    if not isinstance(stored, list) or len(stored) == 0:
        raise HTTPException(status_code=400, detail="stored_embeddings must be a non-empty array")

    best = find_best_match(live_embedding, stored)

    return {
        "match": best["match"],
        "index": best["index"] if best["match"] else -1,
        "userId": best["userId"],
        "distance": round(best["distance"], 4),
        "threshold": DISTANCE_THRESHOLD,
    }


if __name__ == "__main__":
    import uvicorn

    print("Starting face embedding service on http://localhost:8001")
    print(f"Distance threshold: {DISTANCE_THRESHOLD}")
    uvicorn.run(app, host="0.0.0.0", port=8001)

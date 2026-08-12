# Face embedding service for the Sanjeevni backend.
# Serves:
#   POST /embed   - accepts a selfie, returns a 128-dimension face embedding
#   POST /verify  - accepts a selfie + stored embeddings, compares them using
#                   DeepFace and returns the best match
#
# Install:
#   pip install fastapi uvicorn deepface numpy Pillow python-multipart
#
# Run:
#   python face_service.py
#   (starts on http://localhost:8001)

import io
import json
from typing import List

import numpy as np
from deepface import DeepFace
from fastapi import FastAPI, File, Form, HTTPException, UploadFile

app = FastAPI(title="Sanjeevni Face Embedding Service")

# Facenet produces 128-dim embeddings, matching the user.faceEmbedding schema.
MODEL_NAME = "Facenet"
DETECTOR_BACKEND = "opencv"
DISTANCE_METRIC = "cosine"


def _read_image(data: bytes) -> np.ndarray:
    try:
        from PIL import Image

        img = Image.open(io.BytesIO(data))
        img.load()
        return np.array(img)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read image: {exc}")


def _get_embedding(img: np.ndarray) -> List[float]:
    try:
        result = DeepFace.represent(
            img_path=img,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=True,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Face detection failed: {exc}")

    if not result:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    return [float(x) for x in result[0]["embedding"]]


@app.get("/")
async def health():
    return {"status": "ok", "service": "face-embedding", "model": MODEL_NAME}


@app.post("/embed")
async def embed(image: UploadFile = File(...)):
    """Accepts a selfie and returns {'embedding': [128 floats]}."""
    img = _read_image(await image.read())
    embedding = _get_embedding(img)
    return {"embedding": embedding, "model": MODEL_NAME, "dimensions": len(embedding)}


@app.post("/verify")
async def verify(image: UploadFile = File(...), stored_embeddings: str = Form(...)):
    """Compares a live selfie against stored embeddings using DeepFace.

    Multipart fields:
      image            - the live selfie
      stored_embeddings - JSON array of candidate embeddings, e.g. [[0.1, ...], ...]

    Returns the closest candidate, its cosine distance and DeepFace's threshold.
    """
    img = _read_image(await image.read())
    live = _get_embedding(img)

    try:
        stored = json.loads(stored_embeddings)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="stored_embeddings must be valid JSON")

    if not isinstance(stored, list) or not stored:
        raise HTTPException(status_code=400, detail="stored_embeddings must be a non-empty array")

    best = None
    for index, candidate in enumerate(stored):
        if not isinstance(candidate, list) or len(candidate) != len(live):
            continue

        result = DeepFace.verify(
            img1_path=live,
            img2_path=candidate,
            model_name=MODEL_NAME,
            distance_metric=DISTANCE_METRIC,
        )

        distance = float(result["distance"])
        if best is None or distance < best["distance"]:
            best = {
                "index": index,
                "distance": distance,
                "threshold": float(result["threshold"]),
            }

    if best is None:
        raise HTTPException(status_code=400, detail="No valid stored embeddings provided")

    return {
        "match": best["distance"] <= best["threshold"],
        "distance": best["distance"],
        "threshold": best["threshold"],
        "index": best["index"],
        "model": MODEL_NAME,
        "metric": DISTANCE_METRIC,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)

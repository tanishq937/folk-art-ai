from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import resnet18
from PIL import Image
import numpy as np
import json
import pickle
import joblib
import cv2
import io
import sqlite3

from gradcam_utils import generate_gradcam
from similarity_utils import find_similar
from cultural_utils import load_cultural_data, generate_writeup

app = FastAPI(title="Indian Folk Art Intelligence System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------- Database Setup ----------
conn = sqlite3.connect("analytics.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        style TEXT,
        style_confidence REAL,
        authenticity TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
""")
conn.commit()

# ---------- Load everything once, at startup ----------

with open("../models/style_classes.json") as f:
    style_classes = json.load(f)

style_model = resnet18(weights=None)
style_model.fc = nn.Linear(style_model.fc.in_features, len(style_classes))
style_model.load_state_dict(torch.load("../models/style_classifier_v2.pth", map_location=device))
style_model = style_model.to(device)
style_model.eval()

embedding_model = nn.Sequential(*list(style_model.children())[:-1])
embedding_model = embedding_model.to(device)
embedding_model.eval()

auth_model = joblib.load("../models/authenticity_rf.pkl")
with open("../models/authenticity_features.json") as f:
    auth_feature_order = json.load(f)

with open("../models/embedding_db.pkl", "rb") as f:
    embedding_db = pickle.load(f)

cultural_data = load_cultural_data("../models/cultural_data.json")

img_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

print("All models loaded. Server ready.")

# ---------- Root check ----------

@app.get("/")
def root():
    return {"status": "Indian Folk Art Intelligence System is running"}

import base64

def extract_auth_features(pil_img):
    img_array = np.array(pil_img.convert("RGB"))
    img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
    hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
    sat_mean = hsv[:, :, 1].mean()
    sat_std = hsv[:, :, 1].std()
    edges = cv2.Canny(gray, 100, 200)
    edge_density = np.sum(edges > 0) / edges.size
    noise = np.std(gray.astype(np.float32) - cv2.GaussianBlur(gray, (5, 5), 0).astype(np.float32))

    return [[sharpness, sat_mean, sat_std, edge_density, noise]]

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # 1. Style prediction
    input_tensor = img_transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = style_model(input_tensor)
        pred_idx = outputs.argmax(dim=1).item()
        confidence = torch.softmax(outputs, dim=1)[0][pred_idx].item()
    predicted_style = style_classes[pred_idx]

    # 2. Authenticity check
    auth_features = extract_auth_features(img)
    auth_pred = auth_model.predict(auth_features)[0]
    auth_proba = auth_model.predict_proba(auth_features)[0]
    auth_confidence = float(max(auth_proba))

    # 3. Grad-CAM heatmap
    img.save("_temp_upload.jpg")
    _, heatmap_img = generate_gradcam("_temp_upload.jpg", style_model, style_model.layer4[-1], device)
    heatmap_pil = Image.fromarray(heatmap_img)
    buf = io.BytesIO()
    heatmap_pil.save(buf, format="JPEG")
    heatmap_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    # 4. Similarity search
    with torch.no_grad():
        embedding = embedding_model(input_tensor).squeeze().cpu().numpy()
    similar_results = find_similar(embedding, embedding_db, top_k=5)

    # 5. Cultural write-up
    writeup = generate_writeup(predicted_style, cultural_data)

    # 6. Log to DB
    cursor.execute(
        "INSERT INTO analysis_logs (style, style_confidence, authenticity) VALUES (?, ?, ?)",
        (predicted_style, round(confidence, 3), str(auth_pred))
    )
    conn.commit()

    return {
        "predicted_style": predicted_style,
        "style_confidence": round(confidence, 3),
        "authenticity": {
            "prediction": str(auth_pred),
            "confidence": round(auth_confidence, 3)
        },
        "gradcam_heatmap_base64": heatmap_b64,
        "similar_paintings": [
            {"style": r["style"], "similarity": round(r["similarity"], 3)} for r in similar_results
        ],
        "cultural_info": writeup
    }

@app.get("/styles")
def get_styles():
    styles = []
    for style_key in style_classes:
        if style_key in cultural_data:
            writeup = generate_writeup(style_key, cultural_data)
            writeup["original_key"] = style_key
            styles.append(writeup)
    return {"styles": styles}

@app.post("/analyze-authenticity-only")
async def analyze_authenticity_only(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # Authenticity check
    auth_features = extract_auth_features(img)
    auth_pred = auth_model.predict(auth_features)[0]
    auth_proba = auth_model.predict_proba(auth_features)[0]
    auth_confidence = float(max(auth_proba))

    return {
        "authenticity": {
            "prediction": str(auth_pred),
            "confidence": round(auth_confidence, 3)
        }
    }

@app.get("/analytics-data")
def get_analytics_data():
    cursor.execute("SELECT COUNT(*) FROM analysis_logs")
    total_scans = cursor.fetchone()[0]

    cursor.execute("SELECT AVG(style_confidence) FROM analysis_logs")
    avg_conf = cursor.fetchone()[0]
    average_accuracy = round(avg_conf, 3) if avg_conf else 0.0

    cursor.execute("SELECT style, COUNT(*) FROM analysis_logs GROUP BY style")
    style_distribution = {row[0]: row[1] for row in cursor.fetchall()}

    cursor.execute("SELECT authenticity, COUNT(*) FROM analysis_logs GROUP BY authenticity")
    authenticity_ratio = {row[0]: row[1] for row in cursor.fetchall()}

    return {
        "total_scans": total_scans,
        "average_accuracy": average_accuracy,
        "style_distribution": style_distribution,
        "authenticity_ratio": authenticity_ratio
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
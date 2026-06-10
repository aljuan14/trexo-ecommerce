from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os

app = FastAPI(title="TREXO Recommendation Engine API - Mock Mode")

# Konfigurasi CORS agar React bisa menembak API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION & MOCK DATA SETUP ---
CSV_PATH = "electronics_data_subcategory.csv"
PKL_PATH = "recommendation_model.pkl"

# Mengecek apakah file asli sudah ada atau belum
if os.path.exists(CSV_PATH) and os.path.exists(PKL_PATH):
    print("=== RUNNING IN PRODUCTION MODE (REAL DATA) ===")
    import pickle
    df = pd.read_csv(CSV_PATH)
    with open(PKL_PATH, "rb") as f:
        cosine_sim = pickle.load(f)
else:
    print("=== RUNNING IN MOCK MODE (TEMPORARY DATA) ===")
    # Membuat 6 data sampel tiruan agar sistem bisa ditest
    mock_data = {
        'Product_Name': [
            'iPhone 14 Pro Max', 
            'Samsung Galaxy S23 Ultra', 
            'Google Pixel 7 Pro', 
            'Xiaomi 13 Pro', 
            'Asus ROG Phone 7', 
            'Sony Xperia 1 V'
        ],
        'Product_Brand': ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Asus', 'Sony'],
        'Sub_Category': ['Smartphone', 'Smartphone', 'Smartphone', 'Smartphone', 'Gaming Gadget', 'Flagship Gadget']
    }
    df = pd.DataFrame(mock_data)
    
    # Membuat matriks Cosine Similarity tiruan (ukuran 6x6)
    # Angka di bawah ini menyimulasikan kedekatan fitur antar produk
    cosine_sim = np.array([
        [1.0, 0.7, 0.6, 0.5, 0.3, 0.4], # iPhone
        [0.7, 1.0, 0.8, 0.7, 0.4, 0.5], # Samsung
        [0.6, 0.8, 1.0, 0.6, 0.3, 0.4], # Pixel
        [0.5, 0.7, 0.6, 1.0, 0.5, 0.4], # Xiaomi
        [0.3, 0.4, 0.3, 0.5, 1.0, 0.6], # Asus ROG
        [0.4, 0.5, 0.4, 0.4, 0.6, 1.0]  # Sony
    ])

# --- Skema Request ---
class RecommendRequest(BaseModel):
    product_name: str
    top_n: int = 5

# --- Endpoints ---
@app.get("/")
def read_root():
    return {"status": "running", "mode": "Mock" if 'mock_data' in locals() else "Production"}

@app.post("/api/recommend")
def get_recommendations(request: RecommendRequest):
    try:
        # Cari indeks produk berdasarkan nama (case-insensitive & partial match agar lebih fleksibel)
        matched_indices = df.index[df['Product_Name'].str.lower().str.contains(request.product_name.lower())].tolist()
        
        if not matched_indices:
            raise HTTPException(status_code=404, detail=f"Produk '{request.product_name}' tidak ditemukan di database sementara.")
        
        idx = matched_indices[0]
        
        # Mengambil skor similarity dari matriks
        sim_scores = list(enumerate(cosine_sim[idx]))
        
        # Mengurutkan berdasarkan nilai similarity tertinggi
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Mengambil produk alternatif (mengabaikan indeks pertama karena itu produk itu sendiri)
        # Di data tiruan kita batasi sesuai jumlah data yang tersedia
        actual_top_n = min(request.top_n, len(df) - 1)
        sim_scores = sim_scores[1:actual_top_n + 1]
        
        product_indices = [i[0] for i in sim_scores]
        
        # Mengambil baris data dari dataframe
        recommended_products = df.iloc[product_indices][['Product_Name', 'Product_Brand', 'Sub_Category']].to_dict(orient='records')
        
        return {
            "source_product": df.iloc[idx]['Product_Name'],
            "recommendations": recommended_products
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
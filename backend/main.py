from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os
import pickle
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="TREXO Recommendation Engine API - Mock Mode")

# Konfigurasi CORS agar React bisa menembak API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# --- CONFIGURATION & MOCK DATA SETUP ---
PKL_PATH = "recommendation_model.pkl"
MAPPING_PATH = "product_mapping.pkl"

print("Mendownload data produk dari Supabase untuk referensi API...")
response = supabase.table('products').select('*').order('id').execute()
if response.data:
    df = pd.DataFrame(response.data)
else:
    df = pd.DataFrame()

# Mengecek apakah file model ML asli sudah ada atau belum
if os.path.exists(PKL_PATH) and os.path.exists(MAPPING_PATH) and not df.empty:
    print("=== RUNNING IN PRODUCTION MODE (AI ML DATA) ===")
    with open(PKL_PATH, "rb") as f:
        cosine_sim = pickle.load(f)
    with open(MAPPING_PATH, "rb") as f:
        product_mapping = pickle.load(f)
else:
    print("=== RUNNING IN MOCK MODE (TEMPORARY DATA) ===")
    # Fallback to dummy data
    mock_data = {
        'id': [1, 2, 3, 4, 5, 6],
        'Product_Name': [
            'iPhone 14 Pro Max', 'Samsung Galaxy S23 Ultra', 'Google Pixel 7 Pro', 
            'Xiaomi 13 Pro', 'Asus ROG Phone 7', 'Sony Xperia 1 V'
        ],
        'Product_Brand': ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Asus', 'Sony'],
        'Sub_Category': ['Smartphone', 'Smartphone', 'Smartphone', 'Smartphone', 'Gaming Gadget', 'Flagship Gadget'],
        'Price': [21000000, 19500000, 14000000, 15000000, 18000000, 17500000],
        'Image_URL': [''] * 6,
        'Description': [''] * 6,
        'Specs': [''] * 6
    }
    df = pd.DataFrame(mock_data)
    cosine_sim = np.array([
        [1.0, 0.7, 0.6, 0.5, 0.3, 0.4], [0.7, 1.0, 0.8, 0.7, 0.4, 0.5],
        [0.6, 0.8, 1.0, 0.6, 0.3, 0.4], [0.5, 0.7, 0.6, 1.0, 0.5, 0.4],
        [0.3, 0.4, 0.3, 0.5, 1.0, 0.6], [0.4, 0.5, 0.4, 0.4, 0.6, 1.0]
    ])
    product_mapping = df['id'].tolist()

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
        recommended_products = df.iloc[product_indices].to_dict(orient='records')
        
        return {
            "source_product": df.iloc[idx]['Product_Name'],
            "recommendations": recommended_products
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/catalog")
def get_catalog():
    try:
        sample_size = min(12, len(df))
        catalog_df = df.sample(n=sample_size)
        catalog_data = catalog_df.to_dict(orient='records')
        return catalog_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/product/{product_id}")
def get_product(product_id: int):
    try:
        # Pengecekan ada ID
        if 'id' not in df.columns:
            # Fallback for production mode (no 'id' in current CSV)
            # We'll just return the row index as ID for now or 404
            raise HTTPException(status_code=404, detail="ID column not found in database.")
            
        product_df = df[df['id'] == product_id]
        if product_df.empty:
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found.")
            
        product_data = product_df.iloc[0].to_dict()
        return product_data
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Trigger auto-reload for new data
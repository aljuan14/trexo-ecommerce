import os
import pickle
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

load_dotenv()

# Setup Supabase client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def fetch_data_from_supabase():
    print("Mendownload data produk dari Supabase...")
    response = supabase.table('products').select('*').order('id').execute()
    data = response.data
    if not data:
        raise Exception("Tidak ada data produk di Supabase.")
    return pd.DataFrame(data)

def create_content_tags(row):
    """Menggabungkan kolom-kolom relevan menjadi satu paragraf teks utuh."""
    brand = str(row.get('Product_Brand', ''))
    category = str(row.get('Sub_Category', ''))
    description = str(row.get('Description', ''))
    specs = str(row.get('Specs', ''))
    
    # Kita gandakan bobot brand & category dengan mengulangnya
    return f"{brand} {brand} {category} {category} {description} {specs}"

def train_cbf_model(df):
    print(f"Menganalisis {len(df)} produk menggunakan AI (TF-IDF)...")
    
    # Buat kolom baru untuk teks gabungan
    df['content_tags'] = df.apply(create_content_tags, axis=1)
    
    # Inisialisasi TfidfVectorizer dengan stop words bahasa indonesia jika ada, 
    # namun untuk amannya kita gunakan bahasa inggris karena teksnya dominan istilah teknis.
    tfidf = TfidfVectorizer(stop_words='english')
    
    # Fit dan transformasi teks menjadi matriks fitur
    tfidf_matrix = tfidf.fit_transform(df['content_tags'])
    
    # Hitung Cosine Similarity Matrix
    print("Menghitung matriks Cosine Similarity...")
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
    
    # Simpan ID produk secara berurutan agar bisa di-mapping oleh API nanti
    product_mapping = df['id'].tolist()
    
    return cosine_sim, product_mapping

def save_models(cosine_sim, product_mapping):
    print("Menyimpan model ke file .pkl...")
    
    with open('recommendation_model.pkl', 'wb') as f:
        pickle.dump(cosine_sim, f)
        
    with open('product_mapping.pkl', 'wb') as f:
        pickle.dump(product_mapping, f)
        
    print("Model berhasil disimpan!")
    print("- recommendation_model.pkl")
    print("- product_mapping.pkl")

if __name__ == "__main__":
    try:
        df = fetch_data_from_supabase()
        cosine_sim, product_mapping = train_cbf_model(df)
        save_models(cosine_sim, product_mapping)
        print("=== PROSES TRAINING SELESAI ===")
    except Exception as e:
        print(f"Error: {e}")

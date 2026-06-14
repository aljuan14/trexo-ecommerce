# TREXO - Mesin Rekomendasi E-Commerce

**TREXO** adalah platform e-commerce modern yang mengintegrasikan mesin rekomendasi berbasis *machine-learning*. Platform ini memberikan pengalaman pengguna yang mulus dan responsif menggunakan antarmuka React (Vite), dipadukan dengan *backend* Python FastAPI berperforma tinggi yang menyajikan rekomendasi produk berbasis konten (*content-based*).

## Fitur Utama

- **Mesin Rekomendasi Dinamis**: Menggunakan *Content-Based Filtering* (TF-IDF & Cosine Similarity) untuk menyarankan produk serupa berdasarkan merek, kategori, deskripsi, dan spesifikasi.
- **Mode Data Mock & Produksi**: *Backend* akan secara otomatis menggunakan data *mock* (palsu) jika file model *machine learning* tidak ditemukan, sehingga memudahkan pengembangan lokal.
- **UI/UX Modern**: Antarmuka pengguna yang cepat, responsif, dan indah dibangun dengan React 19 dan Tailwind CSS.
- **Integrasi Supabase**: Menggunakan Supabase sebagai Database utama dan *Backend-as-a-Service* (BaaS) untuk menyimpan katalog produk.

## Teknologi yang Digunakan

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **BaaS Client**: Supabase JS Client (`@supabase/supabase-js`)

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **Pemrosesan Data**: Pandas, NumPy
- **Machine Learning**: Scikit-learn (TF-IDF Vectorizer, Linear Kernel untuk Cosine Similarity)
- **Koneksi Database**: Supabase Python Client

## Arsitektur Machine Learning

Sistem rekomendasi ini menggunakan pendekatan **Content-Based Filtering**:
1. **Pengambilan Data**: Skrip `train_model.py` mengambil katalog produk dari Supabase.
2. **Pemrosesan Teks**: Skrip ini menggabungkan `Product_Brand`, `Sub_Category`, `Description`, dan `Specs` menjadi satu blok teks utuh untuk setiap produk.
3. **Vektorisasi**: `TfidfVectorizer` dari Scikit-learn mengubah teks tersebut menjadi matriks fitur TF-IDF.
4. **Perhitungan Kemiripan**: Matriks Cosine Similarity dihitung menggunakan *linear kernel*.
5. **Ekspor Model**: Matriks kemiripan dan pemetaan ID produk yang dihasilkan diekspor sebagai file `.pkl` (`recommendation_model.pkl` dan `product_mapping.pkl`).
6. **API Serving**: *Backend* FastAPI memuat file-file `.pkl` tersebut dan menyajikan rekomendasi secara *real-time* melalui *endpoint* `/api/recommend`.

## 🏁 Memulai Proyek

### Persyaratan
- Node.js (direkomendasikan v18 atau lebih baru)
- Python (direkomendasikan v3.8 atau lebih baru)
- Akun dan proyek Supabase

### Variabel Lingkungan (Environment Variables)

#### Frontend (`.env` di folder utama)
Buat file `.env` di direktori utama (*root*):
```env
VITE_SUPABASE_URL=url_supabase_anda
VITE_SUPABASE_ANON_KEY=anon_key_supabase_anda
```

#### Backend (`backend/.env`)
Buat file `.env` di direktori `backend/`:
```env
SUPABASE_URL=url_supabase_anda
SUPABASE_KEY=service_role_key_supabase_anda
```

### Menjalankan Frontend
1. Buka terminal dan arahkan ke direktori utama.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Mulai server pengembangan Vite:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di `http://localhost:5173`.*

### Menjalankan Backend
1. Arahkan ke direktori `backend/`.
2. Instal dependensi Python:
   ```bash
   pip install fastapi uvicorn pandas numpy scikit-learn python-dotenv supabase
   ```
3. (Opsional) Latih model rekomendasi:
   ```bash
   python train_model.py
   ```
   *Ini akan menghasilkan file `recommendation_model.pkl` dan `product_mapping.pkl`.*
4. Mulai server FastAPI:
   ```bash
   uvicorn main:app --reload
   ```
   *Backend akan berjalan di `http://localhost:8000`.*

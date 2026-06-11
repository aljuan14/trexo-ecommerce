import os
import pandas as pd
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

CSV_PATH = "elektronik_subcategory.csv"

def generate_bulk_products():
    print("Membaca file CSV...")
    df = pd.read_csv(CSV_PATH)
    
    # Ambil kombinasi unik dari Brand, Nama Produk, dan Sub Kategori
    unique_products = df[['Product_Brand', 'products', 'Sub_Category']].drop_duplicates().dropna()
    
    print(f"Ditemukan {len(unique_products)} produk unik. Menyiapkan data untuk Supabase...")
    
    upload_data = []
    
    # URL gambar dummy berdasarkan kategori
    image_map = {
        'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        'Tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
        'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
        'Television': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
        'Headphones': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop'
    }

    for index, row in unique_products.iterrows():
        brand = str(row['Product_Brand']).strip()
        name = str(row['products']).strip()
        sub_cat = str(row['Sub_Category']).strip()
        
        # Tentukan kategori utama untuk gambar dan harga
        main_cat = 'Smartphone'
        if 'TV' in name or 'Television' in sub_cat: main_cat = 'Television'
        elif 'Tab' in name or 'Pad' in name or 'Tablet' in sub_cat: main_cat = 'Tablet'
        elif 'Laptop' in name or 'MacBook' in name or 'Computer' in sub_cat: main_cat = 'Laptop'
        elif 'headphone' in name.lower() or 'Audio' in sub_cat: main_cat = 'Headphones'
        elif 'Phone' in sub_cat: main_cat = 'Smartphone'
            
        # Generate harga acak yang masuk akal (dalam Rupiah)
        base_price = 1000000
        if main_cat == 'Laptop': base_price = random.randint(8, 25) * 1000000
        elif main_cat == 'Smartphone': base_price = random.randint(3, 15) * 1000000
        elif main_cat == 'Television': base_price = random.randint(4, 20) * 1000000
        elif main_cat == 'Tablet': base_price = random.randint(3, 12) * 1000000
        elif main_cat == 'Headphones': base_price = random.randint(5, 30) * 100000
        
        # Generate Spesifikasi buatan
        specs = f"Kualitas Premium dari {brand}. Didesain khusus untuk seri {sub_cat}."
        if main_cat == 'Laptop': specs = f"Intel/AMD Processor, 8GB/16GB RAM, 512GB SSD. {brand} Quality."
        elif main_cat == 'Smartphone': specs = f"Octa-core Processor, 6GB/8GB RAM, 128GB Storage, 5G Ready."
        
        product = {
            "Product_Name": f"{brand} {name}",
            "Product_Brand": brand,
            "Sub_Category": main_cat,
            "Price": base_price,
            "Image_URL": image_map.get(main_cat, image_map['Smartphone']),
            "Description": f"Produk unggulan {name} dari {brand}. Sangat cocok untuk kebutuhan {main_cat.lower()} Anda sehari-hari.",
            "Specs": specs
        }
        upload_data.append(product)
        
    print(f"Mulai mengunggah {len(upload_data)} produk ke Supabase...")
    
    # Hapus semua data yang ada dulu agar bersih (opsional, tapi disarankan)
    # response = supabase.table('products').delete().neq('id', 0).execute()
    # Untuk amannya kita tidak hapus, tapi tambahkan saja
    
    # Upload per batch agar tidak timeout
    batch_size = 50
    for i in range(0, len(upload_data), batch_size):
        batch = upload_data[i:i+batch_size]
        result = supabase.table('products').insert(batch).execute()
        print(f"Batch {i//batch_size + 1} berhasil diunggah.")
        
    print("=== SEEDING SELESAI ===")
    print("Jangan lupa jalankan: python train_model.py")

if __name__ == "__main__":
    generate_bulk_products()

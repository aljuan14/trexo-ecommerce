import os
import pandas as pd
import random
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

CSV_PATH = "electronics_data_subcategory.csv"

def generate_bulk_products():
    print("Membaca file CSV BARU...")
    df = pd.read_csv(CSV_PATH)
    
    unique_products = df[['Product_Brand', 'products', 'Sub_Category']].drop_duplicates().dropna()
    print(f"Ditemukan {len(unique_products)} produk dasar unik dari CSV.")
    
    upload_data = []
    
    image_map = {
        'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        'Tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop',
        'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800&auto=format&fit=crop',
        'Television': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
        'Headphones': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop'
    }

    # Variants to multiply products
    variants = {
        'Smartphone': ['', 'Pro', 'Ultra', 'Plus', 'Lite'],
        'Tablet': ['', 'Pro', 'Mini', 'Kids Edition'],
        'Laptop': ['', '13-inch', '15-inch', 'Pro', 'Gaming Edition'],
        'Television': ['43"', '50"', '55"', '65"', '75"'],
        'Headphones': ['Wired', 'Wireless Bluetooth', 'Pro Noise-Cancelling']
    }

    for index, row in unique_products.iterrows():
        brand = str(row['Product_Brand']).strip()
        name = str(row['products']).strip()
        sub_cat = str(row['Sub_Category']).strip()
        
        main_cat = 'Smartphone'
        if 'TV' in name or 'Television' in sub_cat: main_cat = 'Television'
        elif 'Tab' in name or 'Pad' in name or 'Tablet' in sub_cat: main_cat = 'Tablet'
        elif 'Laptop' in name or 'MacBook' in name or 'Computer' in sub_cat: main_cat = 'Laptop'
        elif 'headphone' in name.lower() or 'Audio' in sub_cat: main_cat = 'Headphones'
        elif 'Phone' in sub_cat: main_cat = 'Smartphone'
            
        # Terapkan varian untuk menggandakan produk!
        cats_variants = variants.get(main_cat, [''])
        for variant in cats_variants:
            final_name = f"{name} {variant}".strip()
            
            base_price = 1000000
            if main_cat == 'Laptop': base_price = random.randint(8, 30) * 1000000
            elif main_cat == 'Smartphone': base_price = random.randint(3, 20) * 1000000
            elif main_cat == 'Television': base_price = random.randint(4, 25) * 1000000
            elif main_cat == 'Tablet': base_price = random.randint(3, 15) * 1000000
            elif main_cat == 'Headphones': base_price = random.randint(5, 40) * 100000
            
            specs = f"Kualitas Premium dari {brand}. Didesain khusus untuk seri {sub_cat}."
            if main_cat == 'Laptop': specs = f"Intel/AMD Processor Terbaru, RAM besar, SSD Cepat. {brand} Original."
            elif main_cat == 'Smartphone': specs = f"Kamera jernih, Baterai awet seharian, Fast Charging. Garansi Resmi {brand} Indonesia."
            
            product = {
                "Product_Name": f"{brand} {final_name}",
                "Product_Brand": brand,
                "Sub_Category": main_cat,
                "Price": base_price,
                "Image_URL": image_map.get(main_cat, image_map['Smartphone']),
                "Description": f"Produk unggulan {final_name} dari {brand}. Cocok untuk menunjang aktivitas {main_cat.lower()} Anda di Indonesia.",
                "Specs": specs
            }
            upload_data.append(product)
        
    print(f"Berhasil menggandakan varian! Total menjadi {len(upload_data)} produk.")
    
    print("Menghapus data lama di Supabase agar tidak bentrok...")
    # Clean the old data first
    # Workaround: Fetch all and delete by IDs (Supabase requires filter for delete)
    try:
        all_prods = supabase.table('products').select('id').execute()
        ids_to_delete = [p['id'] for p in all_prods.data]
        if ids_to_delete:
            supabase.table('products').delete().in_('id', ids_to_delete).execute()
            print(f"Berhasil menghapus {len(ids_to_delete)} produk lama.")
    except Exception as e:
        print("Gagal menghapus produk lama:", e)
    
    print("Mulai mengunggah batch produk baru...")
    batch_size = 50
    for i in range(0, len(upload_data), batch_size):
        batch = upload_data[i:i+batch_size]
        result = supabase.table('products').insert(batch).execute()
        print(f"Batch {i//batch_size + 1} berhasil diunggah.")
        
    print("=== SEEDING SELESAI ===")

if __name__ == "__main__":
    generate_bulk_products()

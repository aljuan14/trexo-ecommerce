import os
from dotenv import load_dotenv
from supabase import create_client, Client
import pandas as pd

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

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
    'Sub_Category': ['Smartphone', 'Smartphone', 'Smartphone', 'Smartphone', 'Gaming Gadget', 'Flagship Gadget'],
    'Price': [21000000, 19500000, 14000000, 15000000, 18000000, 17500000],
    'Image_URL': [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1606293459218-09db171f2017?q=80&w=800&auto=format&fit=crop'
    ],
    'Description': [
        'Smartphone flagship terbaru dari Apple dengan Dynamic Island dan kamera 48MP yang revolusioner.',
        'Kinerja maksimal dengan Snapdragon 8 Gen 2 for Galaxy, dilengkapi S-Pen terintegrasi.',
        'Kamera terbaik di kelasnya dengan chip Google Tensor G2 dan Android paling murni.',
        'Kolaborasi Leica untuk hasil foto profesional dengan sensor 1 inci yang luar biasa.',
        'Smartphone gaming ultimate dengan pendingin aktif, baterai raksasa, dan layar 165Hz.',
        'Didesain untuk kreator konten dengan kamera kelas profesional dan layar 4K OLED.'
    ],
    'Specs': [
        'A16 Bionic, 6GB RAM, 256GB Storage, 6.7" Super Retina XDR',
        'Snapdragon 8 Gen 2, 12GB RAM, 512GB Storage, 6.8" Dynamic AMOLED 2X',
        'Google Tensor G2, 12GB RAM, 256GB Storage, 6.7" LTPO OLED',
        'Snapdragon 8 Gen 2, 12GB RAM, 256GB Storage, 6.73" LTPO AMOLED',
        'Snapdragon 8 Gen 2, 16GB RAM, 512GB Storage, 6.78" AMOLED 165Hz',
        'Snapdragon 8 Gen 2, 12GB RAM, 256GB Storage, 6.5" 4K OLED'
    ]
}

df = pd.DataFrame(mock_data)
records = df.to_dict(orient='records')

print("Starting to upload data to Supabase...")
for record in records:
    # Insert ke tabel products
    # Supabase akan memberikan ID otomatis (SERIAL)
    try:
        response = supabase.table('products').insert(record).execute()
        print(f"Uploaded: {record['Product_Name']}")
    except Exception as e:
        print(f"Error uploading {record['Product_Name']}: {str(e)}")

print("Done uploading mock data!")

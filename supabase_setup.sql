-- Jalankan script ini di SQL Editor pada dashboard Supabase Anda

CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    "Product_Name" TEXT NOT NULL,
    "Product_Brand" TEXT,
    "Sub_Category" TEXT,
    "Price" NUMERIC,
    "Image_URL" TEXT,
    "Description" TEXT,
    "Specs" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengatur RLS (Row Level Security) agar tabel bisa dibaca public
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on products"
    ON public.products FOR SELECT
    USING (true);

-- Allow insert/update/delete for authenticated users (or anon for testing seeding)
-- Untuk kebutuhan seeder otomatis dari python, kita buka akses insert sementara:
CREATE POLICY "Allow anon insert"
    ON public.products FOR INSERT
    WITH CHECK (true);

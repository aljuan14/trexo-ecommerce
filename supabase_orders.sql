-- Jalankan script ini di SQL Editor pada dashboard Supabase Anda

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengatur RLS (Row Level Security) agar tabel aman
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Pengguna hanya bisa melihat pesanannya sendiri
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

-- Pengguna hanya bisa membuat pesanan untuk dirinya sendiri
CREATE POLICY "Users can insert their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

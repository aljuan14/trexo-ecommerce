import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Sync search input with URL params
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
      performSearch(queryParam);
    } else {
      setSearchQuery('');
      setResult(null);
    }
  }, [queryParam]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoadingCatalog(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(12);
        
        if (error) throw error;
        setCatalog(data || []);
      } catch (error) {
        console.error('Error fetching catalog:', error);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    fetchCatalog();
  }, []);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: query, top_n: 5 })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Terjadi kesalahan pada server');
      
      setResult(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert(`Pencarian gagal: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {result ? (
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Hasil Analisis Produk</h2>
              <p className="text-slate-500 mt-1">Produk referensi: <strong className="text-indigo-600">{result.source_product}</strong></p>
            </div>
            <button
              onClick={clearSearch}
              className="text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4"
            >
              Kembali ke Katalog
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" />
              Top 5 Rekomendasi Serupa (Content-Based)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {result.recommendations.map((item, index) => (
                <Link to={`/product/${item.id}`} key={index} className="block border border-slate-100 bg-slate-50 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="h-32 bg-white rounded-lg border border-slate-100 mb-3 flex items-center justify-center overflow-hidden">
                    {item.Image_URL ? (
                      <img src={item.Image_URL} alt={item.Product_Name} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-slate-300">No Image</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase mb-1 block">{item.Product_Brand}</span>
                  <h4 className="font-medium text-sm text-slate-900 line-clamp-2 leading-snug">{item.Product_Name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.Sub_Category}</p>
                  <p className="text-sm font-bold text-slate-800 mt-2">{formatRupiah(item.Price || 0)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Hero Section Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-3xl p-10 text-white mb-10 shadow-lg">
            <h1 className="text-4xl font-bold mb-4">Temukan Gadget Idealmu</h1>
            <p className="text-indigo-200 max-w-xl text-lg mb-8">
              TREXO menggunakan AI Content-Based Filtering untuk mencocokkan spesifikasi dan merekomendasikan alternatif terbaik untukmu.
            </p>

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="md:hidden relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
              />
              <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-500 rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </button>
            </form>
          </div>

          {/* Catalog Grid */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Eksplorasi Populer</h2>
          </div>

          {isLoadingCatalog ? (
            <div className="flex justify-center items-center py-10">
              <span className="text-slate-500 font-medium">Memuat katalog...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {catalog.map((item, index) => (
                <Link
                  to={`/product/${item.id}`}
                  key={index}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                >
                  <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center justify-center overflow-hidden group-hover:bg-slate-100 transition-colors">
                    {item.Image_URL ? (
                      <img src={item.Image_URL} alt={item.Product_Name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-slate-300">No Image</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1 block">{item.Product_Brand}</span>
                  <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{item.Product_Name}</h4>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{formatRupiah(item.Price || 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
            <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-medium text-slate-700">Menganalisis matriks produk...</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Cpu, Cpu as CpuIcon, ArrowRight } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState('Semua');
  const categories = ['Semua', 'Smartphone', 'Laptop', 'Tablet', 'Television', 'Headphones'];

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
          .order('id', { ascending: true })
          .limit(100);
        
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

  const filteredCatalog = activeCategory === 'Semua' 
    ? catalog 
    : catalog.filter(item => item.Sub_Category === activeCategory);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500/20">
      
      {/* 🌟 AI HERO SECTION */}
      <div className="relative overflow-hidden border-b border-indigo-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>TREXO AI Recommendation Engine</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 mb-6 tracking-tight">
            Temukan Elektronik Masa Depanmu
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg mb-10 leading-relaxed font-medium">
            Beritahu AI cerdas kami apa yang Anda cari. Sistem Content-Based Filtering kami akan merekomendasikan pilihan terbaik khusus untuk Anda!
          </p>

          {/* AI Prompt Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl p-2 shadow-xl">
              <div className="pl-4 pr-2 text-indigo-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik impian elektronik Anda (contoh: iPhone 14 Pro, Samsung TV)..."
                className="w-full bg-transparent text-slate-800 text-lg px-2 py-4 focus:outline-none placeholder-slate-400 font-medium"
              />
              <button 
                type="submit" 
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
              >
                {isAnalyzing ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <span>Generate</span>
                    <Sparkles className="w-4 h-4 text-pink-200" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* 🤖 AI RESULTS SECTION */}
        {result ? (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center border border-indigo-200 shadow-sm">
                  <CpuIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                    Hasil Analisis Matriks <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">AI</span>
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">
                    Referensi input: <strong className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded ml-1">{result.source_product}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={clearSearch}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2 transition-colors bg-white hover:bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
              >
                Tutup Analisis
              </button>
            </div>

            <div className="relative">
              {/* Glassmorphism Box for AI Results */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-pink-100 rounded-3xl blur-xl opacity-70"></div>
              <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white shadow-xl">
                
                <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold tracking-wide text-sm uppercase">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Top 5 Rekomendasi Teratas</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                  {result.recommendations.map((item, index) => (
                    <Link to={`/product/${item.id}`} key={index} className="group relative block">
                      <div className="absolute -inset-1 bg-gradient-to-b from-indigo-200 to-pink-200 opacity-0 group-hover:opacity-100 rounded-2xl transition duration-300 blur-sm"></div>
                      <div className="relative bg-white border border-slate-100 rounded-2xl p-4 h-full flex flex-col hover:border-indigo-200 shadow-sm hover:shadow-md transition-all">
                        <div className="h-32 bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center justify-center overflow-hidden">
                          {item.Image_URL ? (
                            <img src={item.Image_URL} alt={item.Product_Name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <span className="text-slate-400">No Image</span>
                          )}
                        </div>
                        <span className="text-[10px] font-extrabold tracking-wider text-indigo-500 uppercase mb-2 block">{item.Product_Brand}</span>
                        <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">{item.Product_Name}</h4>
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">{formatRupiah(item.Price || 0)}</span>
                          <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600 transition-colors -translate-x-2 group-hover:translate-x-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* 📦 GLOBAL CATALOG SECTION */}
        <div className={result ? "opacity-40 grayscale-[20%] pointer-events-none transition-all duration-500" : "transition-all duration-500"}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Eksplorasi Katalog</h2>
              <p className="text-slate-500 font-medium">Jelajahi seluruh koleksi premium kami.</p>
            </div>
            
            {/* Bright Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                    activeCategory === cat
                      ? 'bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoadingCatalog ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-indigo-600 font-bold tracking-wide">Menyiapkan Koleksi Terbaik...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCatalog.map((item, index) => (
                <Link
                  to={`/product/${item.id}`}
                  key={index}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 group flex flex-col"
                >
                  <div className="aspect-square bg-slate-50 rounded-xl mb-5 flex items-center justify-center overflow-hidden">
                    {item.Image_URL ? (
                      <img src={item.Image_URL} alt={item.Product_Name} className="object-cover w-full h-full group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500 mix-blend-multiply" />
                    ) : (
                      <span className="text-slate-400">No Image</span>
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold tracking-widest text-indigo-500 uppercase mb-2 block">{item.Product_Brand}</span>
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 text-sm leading-relaxed">{item.Product_Name}</h4>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">{formatRupiah(item.Price || 0)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;

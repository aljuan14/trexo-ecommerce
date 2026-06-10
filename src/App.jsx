import React, { useState, useEffect } from 'react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // State untuk katalog mock-up (jika ingin menampilkan produk sebelum dicari)
  const [catalog, setCatalog] = useState([
    { Product_Name: "iPhone 14 Pro Max", Product_Brand: "Apple", Sub_Category: "Smartphone" },
    { Product_Name: "Samsung Galaxy S23 Ultra", Product_Brand: "Samsung", Sub_Category: "Smartphone" },
    { Product_Name: "Sony PlayStation 5", Product_Brand: "Sony", Sub_Category: "Gaming Console" },
    { Product_Name: "Dell XPS 15", Product_Brand: "Dell", Sub_Category: "Laptop" },
    { Product_Name: "Sony WH-1000XM5", Product_Brand: "Sony", Sub_Category: "Audio" },
    { Product_Name: "LG C2 OLED TV", Product_Brand: "LG", Sub_Category: "Television" }
  ]);

  const triggerAnalysis = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: searchQuery,
          top_n: 5
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Terjadi kesalahan pada server');
      }

      setResult(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert(`Pencarian gagal: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProductClick = (productName) => {
    setSearchQuery(productName);
    // Kita buat dummy event untuk men-trigger form submission
    const fakeEvent = { preventDefault: () => { } };
    triggerAnalysis(fakeEvent);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setResult(null); setSearchQuery(''); }}>
            <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-bold tracking-tight text-xl text-slate-800">TREXO</span>
          </div>

          {/* Search Bar in Nav */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <form onSubmit={triggerAnalysis} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk elektronik..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer">Katalog</span>
            <span className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer">Kategori</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* State 1: Menampilkan Hasil Rekomendasi */}
        {result ? (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Hasil Analisis Produk</h2>
                <p className="text-slate-500 mt-1">Produk referensi: <strong className="text-indigo-600">{result.source_product}</strong></p>
              </div>
              <button
                onClick={() => { setResult(null); setSearchQuery(''); }}
                className="text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4"
              >
                Kembali ke Katalog
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Top 5 Rekomendasi Serupa (Content-Based)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {result.recommendations.map((item, index) => (
                  <div key={index} className="border border-slate-100 bg-slate-50 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                    <div className="h-32 bg-white rounded-lg border border-slate-100 mb-3 flex items-center justify-center">
                      {/* Placeholder Gambar Produk */}
                      <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase mb-1 block">{item.Product_Brand}</span>
                    <h4 className="font-medium text-sm text-slate-900 line-clamp-2 leading-snug">{item.Product_Name}</h4>
                    <p className="text-xs text-slate-500 mt-2">{item.Sub_Category}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* State 2: Menampilkan Katalog Default (Sebelum Mencari) */
          <div>
            {/* Hero Section Banner */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-3xl p-10 text-white mb-10 shadow-lg">
              <h1 className="text-4xl font-bold mb-4">Temukan Gadget Idealmu</h1>
              <p className="text-indigo-200 max-w-xl text-lg mb-8">
                TREXO menggunakan AI Content-Based Filtering untuk mencocokkan spesifikasi dan merokomendasikan alternatif terbaik untukmu.
              </p>

              {/* Mobile Search Bar */}
              <form onSubmit={triggerAnalysis} className="md:hidden relative mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full pl-4 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
                />
                <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </form>
            </div>

            {/* Catalog Grid */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Eksplorasi Populer</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {catalog.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleProductClick(item.Product_Name)}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100 mb-4 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                    <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1 block">{item.Product_Brand}</span>
                  <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{item.Product_Name}</h4>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{item.Sub_Category}</span>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}

export default App;
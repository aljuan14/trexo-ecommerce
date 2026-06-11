import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase } from '../lib/supabaseClient';
import { formatRupiah } from './Home';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProductAndRecommendations = async () => {
      setIsLoading(true);
      try {
        // Fetch product from Supabase
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (prodError || !prodData) throw new Error('Product not found');
        setProduct(prodData);

        // Fetch recommendations based on product name
        const recRes = await fetch('http://127.0.0.1:8000/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_name: prodData.Product_Name, top_n: 5 })
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData.recommendations || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndRecommendations();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="font-medium text-slate-700">Memuat detail produk...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-800">Produk tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 hover:underline">Kembali ke Katalog</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Kembali</span>
      </button>

      {/* Product Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-12 flex flex-col md:flex-row gap-10">
        <div className="md:w-1/2 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
          {product.Image_URL ? (
            <img src={product.Image_URL} alt={product.Product_Name} className="object-cover w-full h-full aspect-square" />
          ) : (
            <div className="aspect-square flex items-center justify-center text-slate-400">No Image</div>
          )}
        </div>
        
        <div className="md:w-1/2 flex flex-col">
          <span className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-2">{product.Product_Brand}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">{product.Product_Name}</h1>
          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1 rounded-full w-max mb-6">
            {product.Sub_Category}
          </span>
          
          <div className="text-3xl font-black text-slate-800 mb-6">
            {formatRupiah(product.Price || 0)}
          </div>

          <p className="text-slate-600 leading-relaxed mb-8">
            {product.Description || "Deskripsi produk belum tersedia."}
          </p>

          <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">Spesifikasi Utama</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.Specs || "Spesifikasi belum tersedia."}
            </p>
          </div>

          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
                isAdded 
                  ? 'bg-green-500 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
              }`}
            >
              {isAdded ? (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Ditambahkan ke Keranjang
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  Masukkan Keranjang
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Mungkin Anda Juga Suka</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendations.map((item, index) => (
              <Link to={`/product/${item.id}`} key={index} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-400 hover:shadow-md transition-all group">
                <div className="aspect-square bg-slate-50 rounded-xl mb-3 overflow-hidden">
                  {item.Image_URL ? (
                    <img src={item.Image_URL} alt={item.Product_Name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                  )}
                </div>
                <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600">{item.Product_Name}</h4>
                <p className="text-sm font-bold text-slate-800">{formatRupiah(item.Price || 0)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

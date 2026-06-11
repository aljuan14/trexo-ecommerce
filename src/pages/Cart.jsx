import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase } from '../lib/supabaseClient';
import { formatRupiah } from './Home';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = React.useState(true);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });
  }, []);

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Memuat...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8fafc]">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Akses Terbatas</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Anda harus masuk terlebih dahulu untuk melihat keranjang belanja Anda.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Masuk ke Akun
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-indigo-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Sepertinya Anda belum menambahkan produk apapun ke keranjang. Ayo eksplorasi gadget terbaik kami!
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) return;
    setIsCheckingOut(true);
    
    try {
      const orderData = {
        user_id: user.id,
        total_price: getCartTotal(),
        status: 'completed',
        items: cart.map(item => ({
          product_id: item.id,
          name: item.Product_Name,
          price: item.Price,
          quantity: item.quantity,
          image: item.Image_URL
        }))
      };

      const { error } = await supabase.from('orders').insert(orderData);
      
      if (error) throw error;
      
      clearCart();
      alert("Pesanan berhasil dibuat!");
      navigate('/orders');
      
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Terjadi kesalahan saat membuat pesanan.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Keranjang Belanja</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden border border-slate-100">
                {item.Image_URL ? (
                  <img src={item.Image_URL} alt={item.Product_Name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-2 pr-4">{item.Product_Name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 block mt-1">{item.Sub_Category}</span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="font-bold text-lg text-slate-800">
                    {formatRupiah(item.Price)}
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-indigo-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-indigo-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Ringkasan Pesanan</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Total Harga ({cart.length} barang)</span>
                <span>{formatRupiah(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Diskon</span>
                <span className="text-green-500">- Rp 0</span>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Belanja</span>
                <span className="text-xl font-black text-indigo-600">{formatRupiah(getCartTotal())}</span>
              </div>
            </div>

            <button 
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:bg-indigo-400"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Memproses...' : 'Lanjutkan Pembayaran'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

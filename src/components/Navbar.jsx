import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase } from '../lib/supabaseClient';

const Navbar = () => {
  const { getCartCount } = useContext(CartContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-50 px-6 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-indigo-200 transition-shadow">
            <span className="text-white font-extrabold text-xl">T</span>
          </div>
          <span className="font-extrabold tracking-tight text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-slate-800">TREXO</span>
        </Link>

        {/* Spacer to push elements to the right since search is removed */}
        <div className="flex-1"></div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Katalog</Link>
          <Link to="/cart" className="relative text-slate-500 hover:text-indigo-600 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 shadow-md text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border border-white">
                {getCartCount()}
              </span>
            )}
          </Link>
          
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/admin" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors hidden sm:flex items-center gap-1.5 px-2">
                <Settings className="w-4 h-4" /> Admin
              </Link>
              <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
              <Link to="/orders" className="text-sm font-bold text-slate-600 flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">{user.user_metadata?.full_name || 'Pesanan Saya'}</span>
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-pink-500 transition-colors p-2 hover:bg-pink-50 rounded-lg" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors px-2">
                Masuk
              </Link>
              <Link to="/register" className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-200 transition-all">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

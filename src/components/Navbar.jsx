import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, LogOut } from 'lucide-react';
import { CartContext } from '../contexts/CartContext';
import { supabase } from '../lib/supabaseClient';

const Navbar = () => {
  const { getCartCount } = useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app we might redirect to a search page. 
      // For now, if we are not on Home, we redirect to Home with a query param.
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="font-bold tracking-tight text-xl text-slate-800">TREXO</span>
        </Link>

        {/* Search Bar in Nav */}
        <div className="hidden md:block flex-1 max-w-xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk elektronik..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
          </form>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-800 cursor-pointer">Katalog</Link>
          <Link to="/cart" className="relative text-slate-500 hover:text-slate-800 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
          
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/orders" className="text-sm font-semibold text-slate-700 flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <div className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                {user.user_metadata?.full_name || 'Pesanan Saya'}
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                Masuk
              </Link>
              <Link to="/register" className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
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

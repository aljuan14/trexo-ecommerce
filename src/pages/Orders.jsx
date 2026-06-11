import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatRupiah } from './Home';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">Memuat pesanan...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Riwayat Pesanan</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-indigo-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Belum ada pesanan</h2>
          <p className="text-slate-500 mb-6">Anda belum pernah melakukan pemesanan apapun.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ID Pesanan</p>
                  <p className="font-mono text-sm text-slate-900">{order.id.split('-')[0]}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Belanja</p>
                  <p className="text-lg font-black text-indigo-600">{formatRupiah(order.total_price)}</p>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="font-bold text-slate-800 mb-4">Produk yang Dibeli</h4>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-slate-200">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-xs text-slate-400">No Img</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link to={`/product/${item.product_id}`} className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-sm text-slate-500">{item.quantity} x {formatRupiah(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

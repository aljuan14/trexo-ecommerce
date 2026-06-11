import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Edit2, Search, X, Check, Image as ImageIcon } from 'lucide-react';
import { formatRupiah } from './Home';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.Product_Brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (product) => {
    setCurrentProduct({ ...product }); // copy object
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          Image_URL: currentProduct.Image_URL,
          Product_Name: currentProduct.Product_Name,
          Price: currentProduct.Price
        })
        .eq('id', currentProduct.id);
        
      if (error) throw error;
      
      // Update local state
      setProducts(products.map(p => p.id === currentProduct.id ? currentProduct : p));
      setIsEditing(false);
      alert('Produk berhasil diperbarui!');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Gagal memperbarui produk: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Kelola gambar dan data produk Anda.</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Gambar</th>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-500">#{product.id}</td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                        {product.Image_URL ? (
                          <img src={product.Image_URL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{product.Product_Name}</p>
                      <p className="text-xs text-indigo-500 uppercase tracking-wider font-bold mt-1">{product.Product_Brand}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {product.Sub_Category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatRupiah(product.Price)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(product)}
                        className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                      Tidak ada produk yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditing && currentProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Edit Produk #{currentProduct.id}</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col: Image Preview & URL */}
                <div className="space-y-4">
                  <div className="aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center relative group">
                    {currentProduct.Image_URL ? (
                      <img src={currentProduct.Image_URL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <span className="text-sm font-medium">Belum ada gambar</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">URL Gambar (Image URL)</label>
                    <input 
                      type="url" 
                      required
                      value={currentProduct.Image_URL || ''}
                      onChange={(e) => setCurrentProduct({...currentProduct, Image_URL: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="https://..."
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Mendukung link gambar dari Google/Unsplash.</p>
                  </div>
                </div>

                {/* Right Col: Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Produk</label>
                    <input 
                      type="text" 
                      required
                      value={currentProduct.Product_Name}
                      onChange={(e) => setCurrentProduct({...currentProduct, Product_Name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Harga (Rp)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={currentProduct.Price}
                      onChange={(e) => setCurrentProduct({...currentProduct, Price: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <strong>Info:</strong> Mengubah nama produk tidak akan memengaruhi AI kecuali Anda men-train ulang modelnya. Mengubah URL Gambar akan langsung diterapkan di seluruh web.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm shadow-indigo-200"
                >
                  {isSaving ? 'Menyimpan...' : (
                    <>
                      <Check className="w-4 h-4" /> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;

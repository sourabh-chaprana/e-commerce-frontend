import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, X, Package,
  AlertTriangle, Ruler, Upload, Link as LinkIcon, ImagePlus, CheckCircle2,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Men', 'Women', 'Kids', 'Accessories', 'Sale'];
const SIZE_LIST  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const EMPTY_SIZES = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

const EMPTY_FORM = {
  name: '', description: '', price: '', category: 'Men',
  brand: '', stock: '', images: '', useSizes: true,
  sizes: { ...EMPTY_SIZES },
};

const FORM_FIELDS = [
  { key: 'name',  label: 'Product Name', placeholder: 'e.g. Classic Cotton Tee', type: 'text',   required: true  },
  { key: 'brand', label: 'Brand',         placeholder: 'e.g. Velvet Thread',      type: 'text',   required: true  },
  { key: 'price', label: 'Price (₹)',      placeholder: 'e.g. 999',               type: 'number', required: true  },
];

const sizesArrayToMap = (arr) => {
  const map = { ...EMPTY_SIZES };
  if (arr?.length) arr.forEach(({ size, stock }) => { if (size in map) map[size] = stock; });
  return map;
};

const sizesMapToArray = (map) =>
  SIZE_LIST.map((s) => ({ size: s, stock: Number(map[s]) || 0 })).filter((s) => s.stock > 0);

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=60&q=80';

/* ── Image Input Component ── */
const ImageInput = ({ value, onChange }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState('url'); // 'url' | 'upload'
  const [preview, setPreview] = useState(null);

  // Parse first URL from comma-separated value for preview
  const firstUrl = value?.split(',')[0]?.trim();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Append the live server URL to any existing URLs
      const existing = value?.trim();
      onChange(existing ? `${existing}, ${res.data.url}` : res.data.url);
      toast.success('Image uploaded!');
      setTab('url'); // Switch back to URL tab to show the result
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        Product Image(s)
      </label>

      {/* Tab toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-2">
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
            tab === 'url' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <LinkIcon size={12} /> Paste URL
        </button>
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors ${
            tab === 'upload' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Upload size={12} /> Upload File
        </button>
      </div>

      {tab === 'url' ? (
        <input
          type="text"
          placeholder="https://... (comma-separated for multiple)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field text-sm"
        />
      ) : (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            uploading
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-indigo-600 font-medium">Uploading to server…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImagePlus size={28} className="text-indigo-300" />
              <p className="text-xs font-semibold text-gray-600">Click to choose an image</p>
              <p className="text-[10px] text-gray-400">JPG, PNG, WebP, GIF · Max 5 MB</p>
            </div>
          )}
        </div>
      )}

      {/* Preview strip */}
      {(firstUrl || preview) && (
        <div className="mt-2 flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
          <img
            src={preview || firstUrl}
            alt="preview"
            className="w-12 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            onError={(e) => { e.target.src = FALLBACK; }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-green-500" /> Preview
            </p>
            <p className="text-[10px] text-gray-400 break-all line-clamp-2">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => { onChange(''); setPreview(null); }}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={12} className="text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Main Component ── */
const AdminProducts = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products?limit=200');
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    const hasSizes = product.sizes?.length > 0;
    setForm({
      name:        product.name,
      description: product.description,
      price:       product.price,
      category:    product.category,
      brand:       product.brand,
      stock:       product.stock,
      images:      product.images?.join(', ') || '',
      useSizes:    hasSizes,
      sizes:       hasSizes ? sizesArrayToMap(product.sizes) : { ...EMPTY_SIZES },
    });
    setModalOpen(true);
  };

  const totalSizeStock = Object.values(form.sizes).reduce((a, b) => a + (Number(b) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const sizesArray = form.useSizes ? sizesMapToArray(form.sizes) : [];
    const payload = {
      name:        form.name,
      description: form.description,
      price:       Number(form.price),
      category:    form.category,
      brand:       form.brand,
      stock:       form.useSizes ? totalSizeStock : Number(form.stock),
      images:      form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
      sizes:       sizesArray,
    };
    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingProduct._id ? res.data : p)));
        toast.success('Product updated!');
      } else {
        const res = await api.post('/products', payload);
        setProducts((prev) => [res.data, ...prev]);
        toast.success('Product created!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, brand, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 text-center text-gray-400 text-sm">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <Package size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No products found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Category', 'Price', 'Sizes / Stock', 'Rating', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || FALLBACK}
                          alt={product.name}
                          className="w-10 h-12 object-cover rounded-xl flex-shrink-0"
                          onError={(e) => { e.target.src = FALLBACK; }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-indigo-50 text-indigo-700">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {product.sizes?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.sizes.map(({ size, stock }) => (
                            <span key={size} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              stock === 0 ? 'bg-red-50 text-red-400 line-through'
                              : stock <= 3 ? 'bg-orange-50 text-orange-600'
                              : 'bg-green-50 text-green-700'
                            }`}>
                              {size}:{stock}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={`badge ${
                          product.stock > 10 ? 'bg-green-50 text-green-700'
                          : product.stock > 0 ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-600'
                        }`}>
                          {product.stock > 0 ? product.stock : 'Out'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">★ {product.ratings.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(product)} className="p-2 rounded-xl hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 transition-colors" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteConfirm(product._id)} className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ===== PRODUCT MODAL ===== */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">

                {/* Basic text/number fields */}
                {FORM_FIELDS.map(({ key, label, placeholder, type, required }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <input
                      type={type}
                      required={required}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-field text-sm"
                      min={type === 'number' ? '0' : undefined}
                    />
                  </div>
                ))}

                {/* Image — URL or Upload */}
                <ImageInput
                  value={form.images}
                  onChange={(val) => setForm({ ...form, images: val })}
                />

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-field text-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the product..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field text-sm resize-none"
                  />
                </div>

                {/* Size toggle */}
                <div className="flex items-center gap-3 py-2 border-t border-gray-100">
                  <Ruler size={15} className="text-indigo-500" />
                  <label className="text-xs font-semibold text-gray-700 flex-1">Enable Per-Size Stock</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, useSizes: !form.useSizes })}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.useSizes ? 'bg-indigo-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.useSizes ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Sizes or global stock */}
                {form.useSizes ? (
                  <div className="bg-indigo-50/60 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                      <Ruler size={12} /> Stock per Size
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {SIZE_LIST.map((size) => (
                        <div key={size} className="flex items-center gap-2 bg-white rounded-xl px-2 py-1.5 border border-indigo-100">
                          <span className="text-xs font-bold text-indigo-600 w-6">{size}</span>
                          <input
                            type="number"
                            min="0"
                            value={form.sizes[size]}
                            onChange={(e) => setForm({ ...form, sizes: { ...form.sizes, [size]: e.target.value } })}
                            className="w-full bg-transparent text-xs font-semibold text-gray-700 focus:outline-none text-center"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-indigo-600 font-medium">
                      Total stock: <span className="font-bold">{totalSizeStock}</span> units
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Stock Quantity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="input-field text-sm"
                      min="0"
                    />
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DELETE CONFIRM ===== */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full"
            >
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                This action cannot be undone. The product will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">Cancel</button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;

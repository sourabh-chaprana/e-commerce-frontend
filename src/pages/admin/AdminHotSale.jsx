import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Plus, Trash2, X, Search, ToggleLeft, ToggleRight,
  Tag, Percent, GripVertical, AlertTriangle, Package,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=60&q=80';

// ─── Add Product Modal ────────────────────────────────────────────────────────
const AddModal = ({ onClose, onAdded, existingIds }) => {
  const [products, setProducts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [label,    setLabel]    = useState('Hot Deal');
  const [discount, setDiscount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/products?limit=200')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const alreadyAdded = existingIds.has(p._id);
    const matchSearch  = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.brand.toLowerCase().includes(search.toLowerCase());
    return !alreadyAdded && matchSearch;
  });

  const handleAdd = async () => {
    if (!selected) { toast.error('Select a product first'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/hotsale', {
        productId: selected._id,
        label:     label || 'Hot Deal',
        discount:  Number(discount) || 0,
      });
      toast.success(`"${selected.name}" added to Hot Sale`);
      onAdded(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Add to Hot Sale</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={17} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Config fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Tag size={11} /> Label
              </label>
              <input
                className="input-field text-sm"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Hot Deal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Percent size={11} /> Discount %
              </label>
              <input
                className="input-field text-sm"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Product search */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Select Product *
            </label>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="input-field text-sm pl-9"
                placeholder="Search by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center text-sm text-gray-400 py-6">Loading products...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">
                {search ? 'No matching products' : 'All products already added'}
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {filtered.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => setSelected(selected?._id === p._id ? null : p)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selected?._id === p._id
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-gray-100 hover:border-rose-200 hover:bg-rose-50/40'
                    }`}
                  >
                    <img
                      src={p.images?.[0] || FALLBACK}
                      alt={p.name}
                      className="w-10 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => { e.target.src = FALLBACK; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.brand} · {p.category}</p>
                    </div>
                    <span className="font-bold text-indigo-600 text-sm flex-shrink-0">
                      ₹{p.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected preview */}
          {selected && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-3">
              <img
                src={selected.images?.[0] || FALLBACK}
                alt={selected.name}
                className="w-10 h-12 object-cover rounded-lg flex-shrink-0"
                onError={(e) => { e.target.src = FALLBACK; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-rose-500 font-semibold">Selected</p>
                <p className="font-bold text-gray-800 text-sm line-clamp-1">{selected.name}</p>
              </div>
              {discount > 0 && (
                <span className="text-xs font-bold text-white bg-rose-500 px-2 py-1 rounded-lg flex-shrink-0">
                  -{discount}%
                </span>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting || !selected}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Flame size={15} />}
              Add to Hot Sale
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Edit Row Inline ──────────────────────────────────────────────────────────
const EditRow = ({ item, onSave, onCancel }) => {
  const [label,    setLabel]    = useState(item.label);
  const [discount, setDiscount] = useState(item.discount);
  const [saving,   setSaving]   = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/hotsale/${item._id}`, {
        label:    label || 'Hot Deal',
        discount: Number(discount) || 0,
      });
      onSave(res.data);
      toast.success('Updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        className="input-field text-xs py-1.5 px-3 w-28"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label"
      />
      <div className="relative w-20">
        <input
          className="input-field text-xs py-1.5 px-3 w-full pr-6"
          type="number"
          min="0"
          max="100"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          placeholder="0"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary text-xs px-3 py-1.5">
        {saving ? '...' : 'Save'}
      </button>
      <button onClick={onCancel} className="btn-secondary text-xs px-3 py-1.5">
        Cancel
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminHotSale = () => {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [deleteId,    setDeleteId]    = useState(null);
  const [togglingId,  setTogglingId]  = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/hotsale/all');
      setItems(res.data || []);
    } catch {
      toast.error('Failed to load Hot Sale items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleToggle = async (item) => {
    setTogglingId(item._id);
    try {
      const res = await api.put(`/hotsale/${item._id}`, { isActive: !item.isActive });
      setItems((prev) => prev.map((i) => (i._id === item._id ? res.data : i)));
      toast.success(res.data.isActive ? 'Item activated' : 'Item hidden');
    } catch {
      toast.error('Failed to update visibility');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/hotsale/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Removed from Hot Sale');
      setDeleteId(null);
    } catch {
      toast.error('Failed to remove');
    }
  };

  const existingIds = new Set(items.map((i) => i.product?._id));
  const activeCount = items.filter((i) => i.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Flame size={22} className="text-rose-500" />
            Hot Sale
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.length} items · {activeCount} active in slider
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 text-center text-gray-400 text-sm">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package size={28} className="text-rose-300" />
              </div>
              <p className="text-gray-500 font-semibold mb-1">No Hot Sale items yet</p>
              <p className="text-sm text-gray-400">Click "Add Product" to feature a product in the slider</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Label', 'Discount', 'Price', 'Visible', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, i) => {
                  const p = item.product;
                  const discountedPrice = item.discount > 0
                    ? Math.round(p.price * (1 - item.discount / 100))
                    : null;

                  return (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <GripVertical size={14} className="text-gray-200 flex-shrink-0" />
                          <img
                            src={p?.images?.[0] || FALLBACK}
                            alt={p?.name}
                            className="w-10 h-12 object-cover rounded-xl flex-shrink-0"
                            onError={(e) => { e.target.src = FALLBACK; }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm line-clamp-1">{p?.name}</p>
                            <p className="text-xs text-gray-400">{p?.brand} · {p?.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Label / Discount — inline edit or display */}
                      <td className="px-6 py-4" colSpan={editingId === item._id ? 2 : 1}>
                        {editingId === item._id ? (
                          <EditRow
                            item={item}
                            onSave={(updated) => {
                              setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
                              setEditingId(null);
                            }}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <span
                            onClick={() => setEditingId(item._id)}
                            className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:bg-rose-100 transition-colors"
                          >
                            <Flame size={10} />
                            {item.label}
                          </span>
                        )}
                      </td>

                      {/* Discount % */}
                      {editingId !== item._id && (
                        <td className="px-6 py-4">
                          {item.discount > 0 ? (
                            <span className="font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs">
                              -{item.discount}%
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">No discount</span>
                          )}
                        </td>
                      )}

                      {/* Price */}
                      <td className="px-6 py-4">
                        {discountedPrice ? (
                          <div>
                            <p className="font-bold text-rose-600">₹{discountedPrice.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 line-through">₹{p?.price?.toLocaleString()}</p>
                          </div>
                        ) : (
                          <p className="font-bold text-indigo-600">₹{p?.price?.toLocaleString()}</p>
                        )}
                      </td>

                      {/* Toggle visibility */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggle(item)}
                          disabled={togglingId === item._id}
                          className="transition-all"
                          title={item.isActive ? 'Hide from slider' : 'Show in slider'}
                        >
                          {togglingId === item._id ? (
                            <div className="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                          ) : item.isActive ? (
                            <ToggleRight size={26} className="text-indigo-500" />
                          ) : (
                            <ToggleLeft size={26} className="text-gray-300" />
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                          title="Remove from Hot Sale"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <AddModal
            existingIds={existingIds}
            onClose={() => setShowModal(false)}
            onAdded={(item) => setItems((prev) => [item, ...prev])}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteId && (
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
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Remove from Hot Sale?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                The product won't be deleted — only removed from the Hot Sale slider.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-secondary">Cancel</button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHotSale;

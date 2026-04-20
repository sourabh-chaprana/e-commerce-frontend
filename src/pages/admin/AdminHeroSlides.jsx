import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Upload, Image } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  badge: '',
  buttonText: 'Shop Now',
  buttonLink: '/',
  image: '',
  isActive: true,
  sortOrder: 0,
};

const AdminHeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/heroslides/all');
      setSlides(data);
    } catch {
      toast.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (slide) => {
    setEditing(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle || '',
      badge: slide.badge || '',
      buttonText: slide.buttonText || 'Shop Now',
      buttonLink: slide.buttonLink || '/',
      image: slide.image || '',
      isActive: slide.isActive,
      sortOrder: slide.sortOrder ?? 0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/heroslides/${editing._id}`, form);
        toast.success('Slide updated');
      } else {
        await api.post('/heroslides', form);
        toast.success('Slide created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/heroslides/${deleteTarget._id}`);
      toast.success('Slide deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const toggleActive = async (slide) => {
    try {
      await api.put(`/heroslides/${slide._id}`, { isActive: !slide.isActive });
      setSlides((prev) =>
        prev.map((s) => (s._id === slide._id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch {
      toast.error('Update failed');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, image: data.url }));
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
    className:
      'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300',
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hero Slides</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage homepage hero banner slides</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          <Plus size={16} />
          Add Slide
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image size={24} className="text-indigo-300" />
          </div>
          <p className="text-gray-500 font-semibold">No slides yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Add your first hero slide to replace the default banner</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 text-indigo-600 text-sm font-semibold hover:underline"
          >
            <Plus size={14} /> Add Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-28 h-18 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100">
                {slide.image ? (
                  <img src={slide.image} alt={slide.title} className="w-28 h-20 object-cover rounded-xl" />
                ) : (
                  <div className="w-28 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                    <Image size={20} className="text-white/60" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-gray-800 truncate">{slide.title}</p>
                  {slide.badge && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {slide.badge}
                    </span>
                  )}
                </div>
                {slide.subtitle && (
                  <p className="text-sm text-gray-400 truncate mb-1">{slide.subtitle}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Sort: {slide.sortOrder}</span>
                  <span>
                    Button: <span className="text-gray-600">{slide.buttonText}</span>
                  </span>
                  <span
                    className={`font-medium ${slide.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {slide.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(slide)}
                  title={slide.isActive ? 'Deactivate' : 'Activate'}
                  className={`p-2 rounded-lg transition-colors ${
                    slide.isActive
                      ? 'text-green-600 bg-green-50 hover:bg-green-100'
                      : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {slide.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => openEdit(slide)}
                  className="p-2 rounded-lg text-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(slide)}
                  className="p-2 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">
                  {editing ? 'Edit Slide' : 'Add Slide'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {/* Image */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Background Image
                  </label>
                  {form.image && (
                    <div className="w-full h-36 rounded-xl overflow-hidden mb-2 bg-gray-100">
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL or upload"
                      {...field('image')}
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <label
                      className={`flex items-center gap-1.5 px-3 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-medium cursor-pointer hover:bg-indigo-100 transition-colors whitespace-nowrap ${
                        uploading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Upload size={14} />
                      {uploading ? '...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input type="text" required placeholder="e.g. Summer Collection" {...field('title')} />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Subtitle</label>
                  <input type="text" placeholder="e.g. Women's Dress Store" {...field('subtitle')} />
                </div>

                {/* Badge */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Badge Text</label>
                  <input type="text" placeholder="e.g. New Arrival" {...field('badge')} />
                </div>

                {/* Button */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Button Text
                    </label>
                    <input type="text" placeholder="Shop Now" {...field('buttonText')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Button Link
                    </label>
                    <input type="text" placeholder="/" {...field('buttonLink')} />
                  </div>
                </div>

                {/* Sort + Active */}
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                  <div className="pb-0.5">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                      className="flex items-center gap-2.5 w-full"
                    >
                      <div
                        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                          form.isActive ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                            form.isActive ? 'left-5' : 'left-0.5'
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {form.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                  >
                    {saving ? 'Saving...' : editing ? 'Update Slide' : 'Create Slide'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Slide?</h3>
              <p className="text-gray-500 text-sm mb-6">
                "{deleteTarget.title}" will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHeroSlides;

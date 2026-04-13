import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Truck, Shield, TrendingUp, Sparkles } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Accessories', 'Sale'];

const FEATURES = [
  { icon: Truck, text: 'Free Shipping over ₹999' },
  { icon: Shield, text: '100% Authentic' },
  { icon: TrendingUp, text: 'Trending Styles' },
  { icon: Sparkles, text: 'New Arrivals Weekly' },
];

const Home = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');

  // Sync category from URL param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) {
      setCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (category !== 'All') params.category = category;
        const res = await api.get('/products', { params, signal: controller.signal });
        setProducts(res.data.products || []);
      } catch (err) {
        if (err.name !== 'CanceledError') console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [search, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white min-h-[520px] flex items-center">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '0.8s' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-indigo-200 text-xs font-semibold px-5 py-2 rounded-full mb-7 border border-white/20"
            >
              <Sparkles size={12} />
              New Collection 2025
            </motion.span>

            <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              Dress to
              <span className="block bg-gradient-to-r from-indigo-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Impress
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-indigo-200/80 mb-10 leading-relaxed max-w-xl mx-auto">
              Premium garments that blend contemporary style with timeless elegance.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex max-w-lg mx-auto">
              <div className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-l-2xl px-4 focus-within:border-indigo-400 transition-colors">
                <Search size={17} className="text-indigo-300 shrink-0" />
                <input
                  type="text"
                  placeholder="Search garments..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-indigo-300 text-sm py-4 focus:outline-none"
                />
                {searchInput && (
                  <button type="button" onClick={clearSearch}>
                    <X size={15} className="text-indigo-300 hover:text-white" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-rose-500 px-7 py-4 rounded-r-2xl text-sm font-bold hover:shadow-xl hover:shadow-rose-500/30 transition-all duration-200 shrink-0"
              >
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES BAR ===== */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white text-sm font-medium">
                <Icon size={16} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                category === cat
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm'
              }`}
            >
              {cat}
            </button>
          ))}

          {(search || category !== 'All') && (
            <button
              onClick={() => {
                setCategory('All');
                clearSearch();
              }}
              className="px-5 py-2 rounded-full text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400 text-sm">Try a different category or search term</p>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-5">
              Showing {products.length} product{products.length !== 1 ? 's' : ''}
              {search && ` for "${search}"`}
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;

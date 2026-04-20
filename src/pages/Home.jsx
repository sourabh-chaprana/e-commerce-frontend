import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  Truck,
  Shield,
  Sparkles,
  RefreshCw,
  Headphones,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import HotSaleSlider from '../components/HotSaleSlider';
import HeroSlider from '../components/HeroSlider';

const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Accessories', 'Sale'];

const FEATURES = [
  { icon: Truck, text: 'Free Shipping', sub: 'On orders over ₹999' },
  { icon: Headphones, text: '24/7 Support', sub: 'Round the clock help' },
  { icon: RefreshCw, text: '90 Days Return', sub: 'Easy return policy' },
  { icon: Shield, text: '100% Authentic', sub: 'Genuine products only' },
  { icon: CreditCard, text: 'Secure Payment', sub: 'Safe transactions' },
];

const CATEGORY_CARDS = [
  { name: 'Men', from: 'from-blue-500', to: 'to-indigo-600', emoji: '👔', desc: "Men's collection" },
  { name: 'Women', from: 'from-pink-500', to: 'to-rose-500', emoji: '👗', desc: "Women's collection" },
  { name: 'Kids', from: 'from-yellow-400', to: 'to-orange-500', emoji: '🧸', desc: "Kids' collection" },
  { name: 'Accessories', from: 'from-purple-500', to: 'to-violet-600', emoji: '👜', desc: 'Bags & accessories' },
  { name: 'Sale', from: 'from-red-500', to: 'to-pink-500', emoji: '🏷️', desc: 'Up to 70% off' },
];

const ITEMS_PER_PAGE = 4;

const Home = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLoading, setNewLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [newPage, setNewPage] = useState(0);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORIES.includes(cat)) setCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    api
      .get('/products', { params: { limit: 8 } })
      .then((r) => setNewProducts(r.data.products || []))
      .catch(() => {})
      .finally(() => setNewLoading(false));
  }, []);

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

  const newTotalPages = Math.ceil(newProducts.length / ITEMS_PER_PAGE);
  const visibleNew = newProducts.slice(newPage * ITEMS_PER_PAGE, newPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  return (
    <div className="bg-white">
      {/* ===== HERO SLIDER ===== */}
      <HeroSlider />

      {/* ===== FEATURES BAR ===== */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {FEATURES.map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 text-white">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">{text}</p>
                  <p className="text-xs text-white/70 truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEW COLLECTION ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-7">
          <div>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
              Latest Arrivals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              New Collection
            </h2>
          </div>
          {newTotalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setNewPage((p) => Math.max(0, p - 1))}
                disabled={newPage === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                onClick={() => setNewPage((p) => Math.min(newTotalPages - 1, p + 1))}
                disabled={newPage === newTotalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-30 transition-all"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>

        {newLoading ? (
          <LoadingSkeleton count={4} />
        ) : newProducts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {visibleNew.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </section>

      {/* ===== PROMO BANNERS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            to="/?category=Sale"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 p-8 min-h-[200px] flex flex-col justify-between hover:shadow-xl hover:shadow-rose-500/20 transition-all duration-300"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -right-4 bottom-0 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative z-10">
              <Tag size={20} className="text-white/80 mb-3" />
              <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-1">
                Limited Time
              </p>
              <h3 className="text-3xl font-extrabold text-white leading-tight">
                UP TO<br />70% OFF
              </h3>
            </div>
            <span className="relative z-10 inline-flex items-center self-start gap-1 bg-white text-rose-600 text-xs font-bold px-4 py-2 rounded-full mt-4 group-hover:bg-rose-50 transition-colors">
              Shop Sale <ChevronRight size={13} />
            </span>
          </Link>

          <Link
            to="/?category=Women"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 min-h-[200px] flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300"
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -right-4 bottom-0 w-24 h-24 bg-white/10 rounded-full" />
            <div className="relative z-10">
              <Sparkles size={20} className="text-white/80 mb-3" />
              <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-1">
                Online Exclusive
              </p>
              <h3 className="text-3xl font-extrabold text-white leading-tight">
                BUY ONE<br />GET 1 FREE
              </h3>
            </div>
            <span className="relative z-10 inline-flex items-center self-start gap-1 bg-white text-indigo-600 text-xs font-bold px-4 py-2 rounded-full mt-4 group-hover:bg-indigo-50 transition-colors">
              Shop Now <ChevronRight size={13} />
            </span>
          </Link>
        </div>
      </section>

      {/* ===== HOT SALE ===== */}
      <div className="bg-gray-50 py-2">
        <HotSaleSlider />
      </div>

      {/* ===== BROWSE BY CATEGORY ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
            Explore
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            Browse by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORY_CARDS.map(({ name, from, to, emoji, desc }) => (
            <Link
              key={name}
              to={`/?category=${name}`}
              onClick={() => setCategory(name)}
              className={`group bg-gradient-to-br ${from} ${to} rounded-2xl p-5 text-white text-center hover:scale-105 hover:shadow-xl transition-all duration-200`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <p className="font-extrabold text-base">{name}</p>
              <p className="text-xs text-white/70 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== ALL PRODUCTS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Section header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
              Catalogue
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              All Products
            </h2>
          </div>
          <form onSubmit={handleSearch} className="flex sm:w-72">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-l-xl px-3 focus-within:border-indigo-400 transition-colors">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 text-sm py-2.5 focus:outline-none"
              />
              {searchInput && (
                <button type="button" onClick={clearSearch}>
                  <X size={13} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-r-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-7">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                category === cat
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
          {(search || category !== 'All') && (
            <button
              onClick={() => { setCategory('All'); clearSearch(); }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-all"
            >
              × Clear filters
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
                  transition={{ delay: i * 0.04, duration: 0.35 }}
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

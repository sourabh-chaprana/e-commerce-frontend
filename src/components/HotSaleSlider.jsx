import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Flame, Star } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';
const PER_SLIDE = 2; // items shown per slide

// ─── Single product card inside the slide ─────────────────────────────────────
const SlideCard = ({ item }) => {
  const { addToCart }                        = useCart();
  const { isWishlisted, toggleWishlist }     = useWishlist();
  const { product, label, discount }         = item;

  const discountedPrice = discount > 0
    ? Math.round(product.price * (1 - discount / 100))
    : null;

  return (
    <div className="flex flex-1 items-center gap-5 bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-rose-100/60 shadow-sm min-w-0">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="relative flex-shrink-0 group">
        <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-xl overflow-hidden shadow-lg shadow-rose-100">
          <img
            src={product.images?.[0] || FALLBACK}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = FALLBACK; }}
          />
        </div>
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute -top-2 -right-2 w-11 h-11 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex flex-col items-center justify-center text-white shadow-md shadow-rose-300">
            <span className="text-[10px] font-extrabold leading-none">-{discount}%</span>
            <span className="text-[8px] font-semibold opacity-90">OFF</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Label */}
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 shadow-sm">
          <Flame size={9} />
          {label}
        </span>

        <Link to={`/product/${product._id}`}>
          <h3 className="font-extrabold text-gray-800 text-sm sm:text-base hover:text-rose-600 transition-colors leading-tight line-clamp-1 mb-0.5">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mb-2">{product.brand} · {product.category}</p>

        {/* Stars */}
        {product.ratings > 0 && (
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < Math.round(product.ratings) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
              />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <span className="text-lg font-extrabold text-rose-600">
            ₹{(discountedPrice ?? product.price).toLocaleString()}
          </span>
          {discountedPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.price.toLocaleString()}
            </span>
          )}
          {discountedPrice && (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
              Save ₹{(product.price - discountedPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white px-3 py-2 rounded-xl font-bold text-xs shadow-md shadow-rose-200 hover:shadow-rose-300 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <ShoppingCart size={12} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            onClick={() => toggleWishlist(product)}
            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              isWishlisted(product._id)
                ? 'border-rose-400 bg-rose-50 text-rose-500'
                : 'border-gray-200 bg-white text-gray-300 hover:border-rose-300 hover:text-rose-400'
            }`}
          >
            <Heart size={13} className={isWishlisted(product._id) ? 'fill-rose-500' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main slider ──────────────────────────────────────────────────────────────
const HotSaleSlider = () => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0); // slide index (each slide = PER_SLIDE items)
  const [paused, setPaused]   = useState(false);
  const timerRef              = useRef(null);

  useEffect(() => {
    api.get('/hotsale')
      .then((res) => setItems(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total      = items.length;
  const slideCount = Math.ceil(total / PER_SLIDE); // number of slides

  const next = useCallback(() => setCurrent((c) => (c + 1) % slideCount), [slideCount]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slideCount) % slideCount), [slideCount]);

  // Auto-advance every 4 s unless hovered
  useEffect(() => {
    if (slideCount <= 1 || paused) return;
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, [slideCount, paused, next]);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-64 rounded-3xl bg-gradient-to-r from-rose-50 to-orange-50 animate-pulse" />
      </section>
    );
  }

  if (total === 0) return null;

  // Items for the current slide (1 or 2)
  const slideItems = items.slice(current * PER_SLIDE, current * PER_SLIDE + PER_SLIDE);

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Flame size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-gray-800">Hot Sale</h2>
            <p className="text-sm text-gray-400">Limited-time deals on premium picks</p>
          </div>
        </div>

        {/* Dot indicators — one per slide */}
        {slideCount > 1 && (
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: slideCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? 'w-6 h-2.5 bg-rose-500' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-rose-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slider container */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border border-rose-100 shadow-xl shadow-rose-100/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col sm:flex-row gap-4 p-5 sm:p-6"
          >
            {slideItems.map((item) => (
              <SlideCard key={item._id} item={item} />
            ))}

            {/* Ghost placeholder when slide has only 1 item (odd total) */}
            {slideItems.length === 1 && (
              <div className="flex-1 rounded-2xl border-2 border-dashed border-rose-100 hidden sm:flex items-center justify-center">
                <p className="text-xs text-rose-200 font-medium">More deals coming soon</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        {slideCount > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-lg hover:scale-110 transition-all duration-200"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-lg hover:scale-110 transition-all duration-200"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Progress bar */}
        {slideCount > 1 && !paused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-100">
            <motion.div
              key={current}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-rose-500 to-orange-400"
            />
          </div>
        )}
      </div>

      {/* Mobile dot indicators */}
      {slideCount > 1 && (
        <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current ? 'w-6 h-2.5 bg-rose-500' : 'w-2.5 h-2.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HotSaleSlider;

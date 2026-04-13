import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Star, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-28 h-28 bg-gradient-to-br from-rose-50 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Heart size={44} className="text-rose-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 text-sm max-w-sm mx-auto">
            Save items you love by tapping the heart icon on any product.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8">
            Explore Products <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart size={28} className="fill-rose-500 text-rose-500" />
            My Wishlist
          </h1>
          <p className="text-sm text-gray-400 mt-1">{wishlist.length} saved item{wishlist.length !== 1 ? 's' : ''}</p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="text-xs text-red-400 hover:text-red-600 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
          >
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {wishlist.map((product, i) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="card overflow-hidden group relative"
            >
              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(product._id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-red-50 hover:text-red-500 transition-all text-gray-400"
                title="Remove from wishlist"
              >
                <Heart size={14} className="fill-rose-500 text-rose-500" />
              </button>

              {/* Image */}
              <Link to={`/product/${product._id}`}>
                <div className="relative h-60 bg-gray-50 overflow-hidden">
                  <img
                    src={product.images?.[0] || FALLBACK}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = FALLBACK; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute top-3 left-3 badge bg-white/90 text-indigo-700 shadow-sm">
                    {product.category}
                  </span>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="badge bg-red-100 text-red-600 text-sm px-4 py-1.5">Out of Stock</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-semibold text-gray-800 text-sm hover:text-indigo-600 transition-colors line-clamp-1 mb-0.5">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-400 mb-2">{product.brand}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < Math.round(product.ratings) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                    />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">({product.numReviews})</span>
                </div>

                {/* Price + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-indigo-600">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <ShoppingCart size={13} />
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Wishlist;

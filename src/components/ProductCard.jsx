import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product._id);
  const imageUrl = product.images?.[0] || FALLBACK_IMAGE;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="card overflow-hidden group"
    >
      {/* Image */}
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden h-64 bg-gray-50">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge */}
          <span className="absolute top-3 left-3 badge bg-white/90 text-indigo-700 shadow-sm">
            {product.category}
          </span>

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="badge bg-red-100 text-red-600 text-sm px-4 py-1.5">
                Out of Stock
              </span>
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
              className={
                i < Math.round(product.ratings)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-200'
              }
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.numReviews})</span>
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-indigo-600">
            ₹{product.price.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Wishlist toggle */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                wishlisted
                  ? 'border-rose-400 bg-rose-50 text-rose-500'
                  : 'border-gray-200 text-gray-300 hover:border-rose-300 hover:text-rose-400'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={13} className={wishlisted ? 'fill-rose-500' : ''} />
            </button>

            {/* Add to cart */}
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
            >
              <ShoppingCart size={13} />
              Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

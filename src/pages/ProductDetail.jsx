import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Minus,
  Plus,
  Heart,
  Truck,
  RotateCcw,
  LogIn,
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=700&q=80';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data;
        setProduct(p);
        // Pre-select first available size
        if (p.sizes?.length > 0) {
          const first = p.sizes.find((s) => s.stock > 0);
          setSelectedSize(first?.size || null);
        }
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <Spinner />;
  if (!product) return null;

  const hasSizes = product.sizes?.length > 0;
  const images = product.images?.length ? product.images : [FALLBACK];
  const totalStock = product.stock;

  // Max qty: respect selected size's stock or global stock
  const selectedSizeEntry = hasSizes
    ? product.sizes.find((s) => s.size === selectedSize)
    : null;
  const maxQty = selectedSizeEntry
    ? selectedSizeEntry.stock
    : Math.max(1, totalStock);

  const isOutOfStock = totalStock === 0;

  const handleAddToCart = () => {
    if (!user) {
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <LogIn size={18} className="text-indigo-500 shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm">Login required</p>
              <p className="text-xs text-gray-500">Sign in to add items to your cart</p>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate('/login', { state: { from: location } });
              }}
              className="ml-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
            >
              Sign In
            </button>
          </div>
        ),
        { duration: 4000, style: { maxWidth: '360px' } }
      );
      return;
    }

    if (hasSizes && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (isOutOfStock) return;

    addToCart(product, quantity, hasSizes ? selectedSize : null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-8 text-sm font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* ===== IMAGES ===== */}
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-gray-50 shadow-lg">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = FALLBACK; }}
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    i === activeImage
                      ? 'border-indigo-500 shadow-md shadow-indigo-500/20'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ===== DETAILS ===== */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="space-y-6"
        >
          {/* Category + Brand */}
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-indigo-100 text-indigo-700">{product.category}</span>
            <span className="badge bg-gray-100 text-gray-600">{product.brand}</span>
          </div>

          {/* Name + Rating */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(product.ratings)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.ratings.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-4xl font-extrabold text-indigo-600">
            ₹{product.price.toLocaleString()}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock status */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              totalStock > 10 ? 'bg-green-500' : totalStock > 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className={`text-sm font-medium ${totalStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {totalStock > 10
                ? `In Stock (${totalStock} available)`
                : totalStock > 0
                ? `Only ${totalStock} left!`
                : 'Out of Stock'}
            </span>
          </div>

          {/* Size selector — only when product has sizes */}
          {hasSizes && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Select Size:{' '}
                {selectedSize && (
                  <span className="text-indigo-600 font-bold">{selectedSize}</span>
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(({ size, stock }) => {
                  const outOfStock = stock === 0;
                  const lowStock = stock > 0 && stock <= 3;
                  const isSelected = selectedSize === size;
                  return (
                    <div key={size} className="relative">
                      <button
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        className={`w-14 h-12 rounded-xl text-sm font-bold border-2 transition-all duration-200 relative ${
                          outOfStock
                            ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                            : isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-500/20'
                            : 'border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-500'
                        }`}
                      >
                        {size}
                      </button>
                      {lowStock && !outOfStock && (
                        <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {stock}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Strikethrough = out of stock · Orange badge = low stock
              </p>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 transition-all"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-xl">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                disabled={quantity >= maxQty}
                className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
              </button>
              {hasSizes && selectedSize && (
                <span className="text-xs text-gray-400">
                  (max {maxQty} in {selectedSize})
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || (hasSizes && selectedSize && maxQty === 0)}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {!user ? (
                <>
                  <LogIn size={19} /> Sign In to Shop
                </>
              ) : isOutOfStock ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingCart size={19} /> Add to Cart
                </>
              )}
            </button>
            <button
              onClick={() => product && toggleWishlist(product)}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                isWishlisted(product?._id)
                  ? 'border-rose-400 bg-rose-50 text-rose-500'
                  : 'border-gray-200 text-gray-400 hover:border-rose-300 hover:text-rose-400'
              }`}
              title={isWishlisted(product?._id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} className={isWishlisted(product?._id) ? 'fill-rose-500' : ''} />
            </button>
          </div>

          {/* Shipping info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Truck, text: 'Free shipping over ₹999' },
              { icon: RotateCcw, text: '30-day easy returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-3">
                <Icon size={15} className="text-indigo-500 shrink-0" />
                <span className="text-xs font-medium text-indigo-700">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;

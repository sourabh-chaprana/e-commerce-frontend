import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MapPin, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=80';
const EMPTY_ADDRESS = { street: '', city: '', state: '', zipCode: '', country: 'India' };

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [placing, setPlacing] = useState(false);

  const shipping = cartTotal >= 999 ? 0 : 99;
  const grandTotal = cartTotal + shipping;

  const handlePlaceOrder = async () => {
    const { street, city, state, zipCode } = address;
    if (!street || !city || !state || !zipCode) {
      toast.error('Please fill in all shipping address fields');
      return;
    }
    setPlacing(true);
    try {
      await api.post('/orders', {
        items: cartItems.map((i) => ({
          product: i._id,
          quantity: i.quantity,
          size: i.selectedSize || null,
        })),
        shippingAddress: address,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-28 h-28 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingBag size={44} className="text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added anything yet. Let's fix that!
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="badge bg-indigo-100 text-indigo-700 text-sm px-4 py-1.5">
          {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ===== CART ITEMS ===== */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item, i) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 sm:p-5 flex gap-4"
              >
                <Link to={`/product/${item._id}`}>
                  <img
                    src={item.images?.[0] || FALLBACK}
                    alt={item.name}
                    className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { e.target.src = FALLBACK; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/product/${item._id}`}>
                        <h3 className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">{item.brand} · {item.category}</p>
                        {item.selectedSize && (
                          <span className="badge bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5">
                            Size: {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-lg font-bold text-indigo-600 mt-2">
                    ₹{item.price.toLocaleString()}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 transition-all"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 transition-all"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <p className="font-bold text-gray-700 text-sm">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-5">
          {/* Shipping Address */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-500" />
              Shipping Address
            </h3>
            <div className="space-y-3">
              {[
                { key: 'street', label: 'Street', placeholder: '123 Main Street' },
                { key: 'city', label: 'City', placeholder: 'Mumbai' },
                { key: 'state', label: 'State', placeholder: 'Maharashtra' },
                { key: 'zipCode', label: 'ZIP Code', placeholder: '400001' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={address[key]}
                    onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                    className="input-field text-sm py-2.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="card p-6">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Tag size={16} className="text-indigo-500" />
              Order Summary
            </h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-indigo-500">
                  Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping
                </p>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-base"
            >
              {placing ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Place Order <ArrowRight size={17} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

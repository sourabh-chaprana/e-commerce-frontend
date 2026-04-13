import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Settings,
  ArrowRight,
} from 'lucide-react';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&q=80';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock,
    bar: 'bg-yellow-400',
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-700',
    icon: Settings,
    bar: 'bg-blue-400',
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-700',
    icon: Truck,
    bar: 'bg-indigo-400',
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    bar: 'bg-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-600',
    icon: XCircle,
    bar: 'bg-red-400',
  },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api
      .get('/orders/myorders')
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <Spinner />;

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-28 h-28 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Package size={44} className="text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No orders yet</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Your order history will appear here once you place an order.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <span className="badge bg-indigo-100 text-indigo-700 text-sm px-4 py-1.5">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {orders.map((order, i) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const StatusIcon = cfg.icon;
          const isOpen = expanded[order._id];

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card overflow-hidden"
            >
              {/* Status bar */}
              <div className={`h-1 ${cfg.bar}`} />

              {/* Header row */}
              <div
                className="p-5 flex flex-wrap items-center gap-3 sm:gap-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => toggleExpand(order._id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                  <p className="font-mono text-sm text-gray-600 truncate">
                    #{order._id.slice(-10).toUpperCase()}
                  </p>
                </div>

                <div className="text-right sm:text-left">
                  <p className="text-xs text-gray-400 mb-0.5">Date</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total</p>
                  <p className="text-sm font-bold text-indigo-600">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`badge ${cfg.color} flex items-center gap-1.5 px-3 py-1`}>
                    <StatusIcon size={12} />
                    {cfg.label}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={17} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={17} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 space-y-4">
                      <h4 className="text-sm font-bold text-gray-700">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item._id} className="flex items-center gap-3">
                            <img
                              src={item.product?.images?.[0] || FALLBACK}
                              alt={item.product?.name}
                              className="w-12 h-14 object-cover rounded-xl flex-shrink-0"
                              onError={(e) => {
                                e.target.src = FALLBACK;
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                {item.product?.name || 'Product unavailable'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-400">
                                  Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                                </p>
                                {item.size && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                                    {item.size}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-bold text-gray-700 flex-shrink-0">
                              ₹{(item.quantity * item.price).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {order.shippingAddress && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-1">
                            Shipping Address
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                            {order.shippingAddress.state} – {order.shippingAddress.zipCode},{' '}
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Payment:{' '}
                          <span
                            className={
                              order.paymentStatus === 'paid'
                                ? 'text-green-600 font-semibold'
                                : 'text-orange-500 font-semibold'
                            }
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() +
                              order.paymentStatus.slice(1)}
                          </span>
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          Total: ₹{order.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;

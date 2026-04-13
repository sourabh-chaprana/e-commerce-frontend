import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/axios';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-500',
};

const StatCard = ({ title, value, icon: Icon, gradient, sub, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="card p-6 relative overflow-hidden"
  >
    {/* Subtle background decoration */}
    <div className={`absolute -right-4 -top-4 w-20 h-20 ${gradient} rounded-full opacity-10`} />

    <div className="flex items-start justify-between mb-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className={`w-11 h-11 ${gradient} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
        <Icon size={19} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-extrabold text-gray-800 mb-1">{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    totalOrders: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, ordersRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/orders?limit=8'),
        ]);

        const orders = ordersRes.data.orders || [];
        const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const pendingOrders = orders.filter((o) => o.status === 'pending').length;

        setStats({
          products: prodRes.data.total || 0,
          totalOrders: ordersRes.data.total || 0,
          revenue,
          pendingOrders,
        });
        setRecentOrders(orders.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.products,
      icon: Package,
      gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      sub: 'Active listings',
      delay: 0,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      gradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
      sub: 'All time',
      delay: 0.08,
    },
    {
      title: 'Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: IndianRupee,
      gradient: 'bg-gradient-to-br from-emerald-400 to-green-600',
      sub: 'From recent orders',
      delay: 0.16,
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      gradient: 'bg-gradient-to-br from-orange-400 to-rose-500',
      sub: 'Needs attention',
      delay: 0.24,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Recent orders table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp size={17} className="text-indigo-500" />
            Recent Orders
          </h3>
          <Link
            to="/admin/orders"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading orders...</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/products"
          className="card p-5 flex items-center gap-4 hover:border-indigo-300 border-2 border-transparent transition-all group"
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
            <Package size={22} className="text-indigo-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Manage Products</p>
            <p className="text-xs text-gray-400">Add, edit, or delete products</p>
          </div>
          <ArrowRight size={17} className="ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors" />
        </Link>

        <Link
          to="/admin/orders"
          className="card p-5 flex items-center gap-4 hover:border-purple-300 border-2 border-transparent transition-all group"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <ShoppingBag size={22} className="text-purple-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Manage Orders</p>
            <p className="text-xs text-gray-400">Update order statuses</p>
          </div>
          <ArrowRight size={17} className="ml-auto text-gray-300 group-hover:text-purple-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ShoppingBag, RefreshCw, Truck, Package,
  MapPin, Weight, CheckCircle2, Zap, Award, IndianRupee,
  Phone, AlertCircle,
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  shipped:    'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-red-100 text-red-600 border-red-200',
};

const PAYMENT_STYLES = {
  paid:   'bg-green-50 text-green-700',
  unpaid: 'bg-orange-50 text-orange-600',
};

// ─── Courier card inside the Ship modal ──────────────────────────────────────
const CourierOption = ({ c, cheapest, fastest, selected, onSelect }) => {
  const isCheapest  = cheapest?.id === c.id;
  const isFastest   = fastest?.id === c.id;
  const isSelected  = selected?.id === c.id;

  return (
    <div
      onClick={() => onSelect(c)}
      className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-800">{c.name}</span>
            {isCheapest && (
              <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                <IndianRupee size={9} />Cheapest
              </span>
            )}
            {isFastest && (
              <span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                <Zap size={9} />Fastest
              </span>
            )}
            {c.isRecommended && (
              <span className="inline-flex items-center gap-0.5 bg-purple-100 text-purple-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                <Award size={9} />Best
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{c.estimatedDays} day(s) delivery</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-indigo-600">₹{c.rate}</span>
          {isSelected
            ? <CheckCircle2 size={18} className="text-indigo-600 flex-shrink-0" />
            : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
        </div>
      </div>
    </div>
  );
};

// ─── Ship Order Modal ─────────────────────────────────────────────────────────
const ShipModal = ({ order, onClose, onShipped }) => {
  const addr = order.shippingAddress;

  const [phone,    setPhone]    = useState('');
  const [weight,   setWeight]   = useState('0.5');
  const [couriers, setCouriers] = useState([]);
  const [cheapest, setCheapest] = useState(null);
  const [fastest,  setFastest]  = useState(null);
  const [selected, setSelected] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError,   setCalcError]   = useState('');
  const [shipLoading, setShipLoading] = useState(false);

  // Auto-calculate on mount once we have zipCode
  useEffect(() => {
    if (addr?.zipCode) handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCalculate = async () => {
    setCalcLoading(true);
    setCalcError('');
    setCouriers([]);
    setSelected(null);
    try {
      const { data } = await api.post('/shipping/calculate', {
        pickup_postcode:   '110001',
        delivery_postcode: addr.zipCode,
        weight:            parseFloat(weight) || 0.5,
        cod:               0,
      });
      setCouriers(data.couriers || []);
      setCheapest(data.cheapest || null);
      setFastest(data.fastest || null);
      if (data.cheapest) setSelected(data.cheapest); // auto-select cheapest
    } catch (err) {
      setCalcError(err.response?.data?.message || 'Failed to get rates');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleShip = async () => {
    if (!phone.trim()) { toast.error('Enter customer phone number'); return; }
    if (!selected)     { toast.error('Select a courier first'); return; }

    setShipLoading(true);
    try {
      await api.post('/shipping/create-order', {
        orderId:       order._id,
        customerName:  order.user?.name || 'Customer',
        phone:         phone.trim(),
        email:         order.user?.email || '',
        address:       addr.street,
        city:          addr.city,
        state:         addr.state,
        pincode:       addr.zipCode,
        courierId:     selected.id,
        courierName:   selected.name,
        shippingCost:  selected.rate,
        paymentMethod: order.paymentStatus === 'paid' ? 'prepaid' : 'cod',
        weight:        parseFloat(weight) || 0.5,
        items:         order.items.map((i) => ({
          name:          i.product?.name || 'Item',
          sku:           i.product?._id || 'SKU',
          units:         i.quantity,
          selling_price: i.price,
        })),
      });

      // Also mark order as "shipped"
      await api.put(`/orders/${order._id}/status`, { status: 'shipped' });

      toast.success(`Shipment created via ${selected.name}`);
      onShipped(order._id);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shipment');
    } finally {
      setShipLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Create Shipment</p>
              <p className="text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Delivery address (read-only) */}
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin size={11} /> Delivery Address
            </p>
            <p className="font-semibold text-gray-800">{order.user?.name}</p>
            <p className="text-gray-600 text-xs mt-0.5">
              {addr.street}, {addr.city}, {addr.state} — {addr.zipCode}
            </p>
          </div>

          {/* Phone + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Phone size={11} /> Phone *
              </label>
              <input
                className="input w-full text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
                maxLength={10}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Weight size={11} /> Weight (kg) *
              </label>
              <input
                className="input w-full text-sm"
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          {/* Recalculate button */}
          <button
            onClick={handleCalculate}
            disabled={calcLoading}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2"
          >
            {calcLoading
              ? <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              : <RefreshCw size={13} />}
            {calcLoading ? 'Getting rates...' : 'Recalculate Rates'}
          </button>

          {/* Error */}
          {calcError && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 rounded-xl p-3">
              <AlertCircle size={14} /> {calcError}
            </div>
          )}

          {/* Courier list */}
          {couriers.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {couriers.length} couriers available — select one
              </p>
              {couriers.map((c) => (
                <CourierOption
                  key={c.id}
                  c={c}
                  cheapest={cheapest}
                  fastest={fastest}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}

          {/* Ship button */}
          <button
            onClick={handleShip}
            disabled={shipLoading || !selected}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {shipLoading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Truck size={15} />}
            {shipLoading ? 'Creating shipment...' : `Ship via ${selected?.name || '...'}`}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main AdminOrders component ───────────────────────────────────────────────
const AdminOrders = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search,       setSearch]       = useState('');
  const [updatingId,   setUpdatingId]   = useState(null);
  const [shipOrder,    setShipOrder]    = useState(null); // order being shipped
  // Track which order IDs already have a shipment (to disable button)
  const [shippedIds,   setShippedIds]   = useState(new Set());

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const [ordersRes, shipmentsRes] = await Promise.all([
        api.get('/orders', { params }),
        api.get('/shipping/all').catch(() => ({ data: [] })),
      ]);
      setOrders(ordersRes.data.orders || []);
      setShippedIds(new Set((shipmentsRes.data || []).map((s) => s.orderId)));
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Called after successful shipment creation
  const handleShipped = (orderId) => {
    setShippedIds((prev) => new Set([...prev, orderId]));
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: 'shipped' } : o))
    );
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(s) ||
      o.user?.name?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          )}
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field text-sm w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          if (!count) return null;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              className={`badge ${STATUS_STYLES[s]} border px-3 py-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                filterStatus === s ? 'ring-2 ring-offset-1 ring-gray-400' : ''
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}: {count}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 text-center text-gray-400 text-sm">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No orders found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Ship', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order, i) => {
                  const alreadyShipped = shippedIds.has(order._id);
                  const canShip = !alreadyShipped && order.status !== 'cancelled' && order.status !== 'delivered';

                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800 whitespace-nowrap">{order.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400 max-w-[160px] truncate">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600 whitespace-nowrap">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${PAYMENT_STYLES[order.paymentStatus] || PAYMENT_STYLES.unpaid}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          {updatingId === order._id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                            disabled={updatingId === order._id}
                            className={`text-xs font-semibold rounded-full px-3 py-1.5 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors ${
                              STATUS_STYLES[order.status] || STATUS_STYLES.pending
                            }`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      {/* Ship button */}
                      <td className="px-6 py-4">
                        {alreadyShipped ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-full">
                            <CheckCircle2 size={11} /> Shipped
                          </span>
                        ) : canShip ? (
                          <button
                            onClick={() => setShipOrder(order)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 rounded-full hover:shadow-md hover:shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                          >
                            <Truck size={11} /> Ship
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300 px-2">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ship modal */}
      <AnimatePresence>
        {shipOrder && (
          <ShipModal
            order={shipOrder}
            onClose={() => setShipOrder(null)}
            onShipped={handleShipped}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;

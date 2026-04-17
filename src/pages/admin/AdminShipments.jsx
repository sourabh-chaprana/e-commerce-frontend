import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Truck, Search, Package, CheckCircle2, Clock,
  AlertCircle, MapPin, RefreshCw, Globe, Map,
} from 'lucide-react';
import { fetchAllShipments } from '../../redux/shippingSlice';

const STATUS_STYLES = {
  pending:          'bg-yellow-100 text-yellow-700',
  processing:       'bg-blue-100 text-blue-700',
  shipped:          'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-500',
  rto:              'bg-orange-100 text-orange-700',
};

const STATUS_ICONS = {
  pending:          Clock,
  processing:       Package,
  shipped:          Truck,
  out_for_delivery: MapPin,
  delivered:        CheckCircle2,
  cancelled:        AlertCircle,
  rto:              RefreshCw,
};

const ZONE_STYLES = {
  LOCAL:    'bg-green-50 text-green-700 border border-green-200',
  REGIONAL: 'bg-blue-50 text-blue-700 border border-blue-200',
  NATIONAL: 'bg-purple-50 text-purple-700 border border-purple-200',
};

const ZONE_ICONS = {
  LOCAL:    MapPin,
  REGIONAL: Map,
  NATIONAL: Globe,
};

const StatCard = ({ label, value, gradient, icon: Icon }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 ${gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const AdminShipments = () => {
  const dispatch = useDispatch();
  const { shipments, shipmentsLoading } = useSelector((s) => s.shipping);
  const [search, setSearch] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAllShipments());
  }, [dispatch]);

  const filtered = shipments.filter((s) => {
    const matchSearch = [s.orderId, s.customerName, s.awbCode, s.courierName, s.pincode, s.city]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchZone = zoneFilter ? s.zone === zoneFilter : true;
    return matchSearch && matchZone;
  });

  const stats = {
    total:     shipments.length,
    pending:   shipments.filter((s) => s.status === 'pending').length,
    inTransit: shipments.filter((s) => ['processing', 'shipped', 'out_for_delivery'].includes(s.status)).length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
  };

  const zoneCounts = {
    LOCAL:    shipments.filter((s) => s.zone === 'LOCAL').length,
    REGIONAL: shipments.filter((s) => s.zone === 'REGIONAL').length,
    NATIONAL: shipments.filter((s) => s.zone === 'NATIONAL').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800">Shipments</h2>
        <p className="text-sm text-gray-500 mt-1">All shipments with zone-based rates</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total"      value={stats.total}     gradient="bg-gradient-to-br from-indigo-400 to-indigo-600"   icon={Package}      />
        <StatCard label="Pending"    value={stats.pending}   gradient="bg-gradient-to-br from-yellow-400 to-orange-500"   icon={Clock}        />
        <StatCard label="In Transit" value={stats.inTransit} gradient="bg-gradient-to-br from-blue-400 to-indigo-500"     icon={Truck}        />
        <StatCard label="Delivered"  value={stats.delivered} gradient="bg-gradient-to-br from-emerald-400 to-green-600"   icon={CheckCircle2} />
      </div>

      {/* Zone breakdown chips */}
      {shipments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setZoneFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              zoneFilter === '' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            All zones
          </button>
          {['LOCAL', 'REGIONAL', 'NATIONAL'].map((z) => {
            const ZIcon = ZONE_ICONS[z];
            return (
              <button
                key={z}
                onClick={() => setZoneFilter(zoneFilter === z ? '' : z)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  zoneFilter === z ? ZONE_STYLES[z] + ' ring-2 ring-offset-1 ring-gray-400' : ZONE_STYLES[z] + ' opacity-70 hover:opacity-100'
                }`}
              >
                <ZIcon size={10} />
                {z}: {zoneCounts[z]}
              </button>
            );
          })}
        </div>
      )}

      {/* Table card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Search + refresh */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              className="input-field pl-9 py-2 text-sm"
              placeholder="Search by order ID, name, AWB, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => dispatch(fetchAllShipments())}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {shipmentsLoading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading shipments...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              {search || zoneFilter ? 'No shipments match your filters' : 'No shipments yet'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Destination', 'Zone', 'Courier', 'AWB', 'Status', 'Cost', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => {
                  const StatusIcon = STATUS_ICONS[s.status] || Clock;
                  const ZIcon      = ZONE_ICONS[s.zone] || Globe;

                  return (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        #{s.orderId.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{s.customerName}</p>
                        <p className="text-xs text-gray-400">{s.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-700 text-xs">{s.city}</p>
                        <p className="text-xs text-gray-400">{s.state} · {s.pincode}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${ZONE_STYLES[s.zone] || ''}`}>
                          <ZIcon size={10} />
                          {s.zone || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">
                        {s.courierName || '—'}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-indigo-600 whitespace-nowrap">
                        {s.awbCode || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge inline-flex items-center gap-1.5 ${STATUS_STYLES[s.status] || STATUS_STYLES.pending}`}>
                          <StatusIcon size={10} />
                          {s.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-indigo-600 whitespace-nowrap">
                        ₹{s.shippingCost}
                      </td>
                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', {
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
      </motion.div>
    </div>
  );
};

export default AdminShipments;

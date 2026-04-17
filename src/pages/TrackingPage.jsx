import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { trackShipment, clearTracking } from '../redux/shippingSlice';

/* Maps Shiprocket status strings to a step index (0-3) */
const STATUS_STEP = {
  'Pickup Pending': 0,
  'Pickup Scheduled': 0,
  'Picked Up': 1,
  'In Transit': 1,
  'Out For Delivery': 2,
  'Delivered': 3,
  'Delivery Failed': 2,
  'RTO Initiated': 2,
  'RTO Delivered': 3,
};

const STEPS = [
  { label: 'Order Placed', icon: Package },
  { label: 'Picked Up', icon: Truck },
  { label: 'Out for Delivery', icon: MapPin },
  { label: 'Delivered', icon: CheckCircle2 },
];

const TrackingTimeline = ({ tracking, shipment }) => {
  const status = tracking?.shipment_status || 'Pickup Pending';
  const currentStep = STATUS_STEP[status] ?? 0;
  const activities = tracking?.shipment_track_activities || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Status badge */}
      <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Current Status</p>
          <p className="text-xl font-extrabold text-gray-800 mt-0.5">{status}</p>
          {shipment?.courierName && (
            <p className="text-sm text-gray-500 mt-0.5">via {shipment.courierName}</p>
          )}
        </div>
        {shipment?.awbCode && (
          <div className="text-right">
            <p className="text-xs text-gray-400">AWB Number</p>
            <p className="font-mono font-bold text-indigo-600 text-sm">{shipment.awbCode}</p>
          </div>
        )}
      </div>

      {/* Progress stepper */}
      <div className="card p-6">
        <div className="flex items-center justify-between relative">
          {/* Progress bar behind icons */}
          <div className="absolute left-0 right-0 top-5 h-1 bg-gray-100 rounded-full mx-10" />
          <div
            className="absolute left-0 top-5 h-1 bg-indigo-500 rounded-full transition-all duration-700"
            style={{
              width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - ${currentStep === STEPS.length - 1 ? 0 : 40}px)`,
              marginLeft: 40,
            }}
          />

          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex flex-col items-center gap-2 z-10">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: done ? 1 : 0.85 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    done
                      ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Icon size={16} className={done ? 'text-white' : 'text-gray-300'} />
                </motion.div>
                <p className={`text-xs font-semibold text-center w-16 ${done ? 'text-indigo-700' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment details */}
      {shipment && (
        <div className="card p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: 'Customer', value: shipment.customerName },
            { label: 'Phone', value: shipment.phone },
            { label: 'Pincode', value: shipment.pincode },
            { label: 'City', value: shipment.city },
            { label: 'Payment', value: shipment.paymentMethod?.toUpperCase() },
            { label: 'Shipping Cost', value: `₹${shipment.shippingCost}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{value || '—'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Activity log */}
      {activities.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Clock size={15} className="text-indigo-500" />
              Tracking History
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {activities.map((act, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 px-5 py-3.5"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{act.activity}</p>
                  {act.location && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {act.location}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {act.date ? new Date(act.date).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  }) : ''}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const TrackingPage = () => {
  const dispatch = useDispatch();
  const { trackingData, trackedShipment, trackLoading, trackError } = useSelector(
    (s) => s.shipping
  );
  const [awb, setAwb] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!awb.trim()) {
      toast.error('Enter an AWB / tracking number');
      return;
    }
    dispatch(clearTracking());
    dispatch(trackShipment(awb.trim()));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
          <Truck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Track Shipment</h1>
          <p className="text-sm text-gray-500">Real-time order tracking</p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSearch}
        className="card p-5"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          AWB / Tracking Number
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              className="input w-full pl-10"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter AWB number..."
            />
          </div>
          <button
            type="submit"
            disabled={trackLoading}
            className="btn-primary px-6 flex items-center gap-2"
          >
            {trackLoading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            Track
          </button>
        </div>
      </motion.form>

      {/* Error */}
      <AnimatePresence>
        {trackError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card p-4 bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm"
          >
            <AlertCircle size={17} />
            {trackError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {trackingData && (
        <TrackingTimeline tracking={trackingData} shipment={trackedShipment} />
      )}
    </div>
  );
};

export default TrackingPage;

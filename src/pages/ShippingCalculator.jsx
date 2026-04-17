import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, MapPin, Weight, Package, RotateCcw,
  ArrowRight, MapPinned, Zap, IndianRupee, Clock, CheckCircle2, Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { calculateShipping, clearCalc } from '../redux/shippingSlice';

// ─── Zone badge ───────────────────────────────────────────────────────────────
const ZONE_CONFIG = {
  LOCAL:    { label: 'Local Delivery',    color: 'bg-green-100 text-green-700 border-green-200',    dot: 'bg-green-500' },
  REGIONAL: { label: 'Regional Delivery', color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500'  },
  NATIONAL: { label: 'National Delivery', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
};

const ZoneBadge = ({ zone }) => {
  const cfg = ZONE_CONFIG[zone] || ZONE_CONFIG.NATIONAL;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Single courier card ──────────────────────────────────────────────────────
const CourierCard = ({ c, cheapest, fastest, selected, onSelect }) => {
  const isCheapest  = cheapest?.id === c.id;
  const isFastest   = fastest?.id  === c.id;
  const isSelected  = selected?.id === c.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(isSelected ? null : c)}
      className={`card p-4 cursor-pointer transition-all border-2 ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50/60 shadow-indigo-100 shadow-md'
          : 'border-transparent hover:border-indigo-200'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-800 text-sm">{c.name}</p>
            {isCheapest && (
              <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                <IndianRupee size={9} /> Cheapest
              </span>
            )}
            {isFastest && (
              <span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                <Zap size={9} /> Fastest
              </span>
            )}
            {c.isRecommended && (
              <span className="inline-flex items-center gap-0.5 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                <Award size={9} /> Recommended
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {c.estimatedDays} {c.estimatedDays === 1 ? 'day' : 'days'}
            </span>
            {c.cod
              ? <span className="text-green-600 font-medium">COD +₹{c.codCharges}</span>
              : <span className="text-gray-400">Prepaid only</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-extrabold text-indigo-600">₹{c.rate}</p>
            <p className="text-[10px] text-gray-400">incl. GST</p>
          </div>
          {isSelected
            ? <CheckCircle2 size={20} className="text-indigo-600" />
            : <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ShippingCalculator = () => {
  const dispatch = useDispatch();
  const { couriers, cheapest, fastest, calcLoading, calcError } = useSelector((s) => s.shipping);
  // zone / state info returned by the API
  const shippingData = useSelector((s) => s.shipping);

  const [form, setForm] = useState({
    pickup_postcode:   '110001',
    delivery_postcode: '',
    weight:            '',
    cod:               false,
  });
  const [filter,    setFilter]    = useState('all');
  const [selected,  setSelected]  = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.delivery_postcode || form.delivery_postcode.length !== 6) {
      toast.error('Enter a valid 6-digit delivery pincode');
      return;
    }
    if (!form.weight || parseFloat(form.weight) <= 0) {
      toast.error('Enter a valid weight');
      return;
    }
    dispatch(clearCalc());
    setSelected(null);
    setFilter('all');
    setSubmitted(true);
    dispatch(calculateShipping({
      pickup_postcode:   form.pickup_postcode,
      delivery_postcode: form.delivery_postcode,
      weight:            parseFloat(form.weight),
      cod:               form.cod ? 1 : 0,
    }));
  };

  const handleReset = () => {
    dispatch(clearCalc());
    setSubmitted(false);
    setSelected(null);
    setForm((f) => ({ ...f, delivery_postcode: '', weight: '', cod: false }));
  };

  const displayed = filter === 'cheapest'
    ? (cheapest ? [cheapest] : [])
    : filter === 'fastest'
    ? (fastest  ? [fastest]  : [])
    : couriers;

  const { zone, fromState, toState } = shippingData;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Calculator size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Shipping Calculator</h1>
          <p className="text-sm text-gray-500">Instant rates — no signup needed</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pickup */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup Pincode</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="input-field pl-9 text-sm"
                name="pickup_postcode"
                value={form.pickup_postcode}
                onChange={handleChange}
                maxLength={6}
                placeholder="110001"
                required
              />
            </div>
          </div>

          {/* Delivery */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Delivery Pincode</label>
            <div className="relative">
              <MapPinned size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="input-field pl-9 text-sm"
                name="delivery_postcode"
                value={form.delivery_postcode}
                onChange={handleChange}
                maxLength={6}
                placeholder="400001"
                required
              />
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Weight (kg)</label>
            <div className="relative">
              <Weight size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="input-field pl-9 text-sm"
                name="weight"
                type="number"
                step="0.1"
                min="0.1"
                value={form.weight}
                onChange={handleChange}
                placeholder="0.5"
                required
              />
            </div>
          </div>

          {/* COD toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
            <div className="flex gap-2 h-[46px]">
              {[{ val: false, label: 'Prepaid' }, { val: true, label: 'COD' }].map(({ val, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, cod: val }))}
                  className={`flex-1 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.cod === val
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500 hover:border-indigo-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={calcLoading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {calcLoading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Package size={15} />}
            {calcLoading ? 'Calculating...' : 'Check Rates'}
          </button>
          {submitted && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-all"
            >
              <RotateCcw size={15} />
            </button>
          )}
        </div>
      </motion.form>

      {/* Error */}
      <AnimatePresence>
        {calcError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="card p-4 bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {calcError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {!calcLoading && submitted && couriers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Zone info banner */}
            {zone && (
              <div className="card p-4 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin size={14} className="text-gray-400" />
                  <span className="font-bold">{fromState}</span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPinned size={14} className="text-gray-400" />
                  <span className="font-bold">{toState}</span>
                </div>
                <div className="ml-auto">
                  <ZoneBadge zone={zone} />
                </div>
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2">
              {['all', 'cheapest', 'fastest'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                    filter === f
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {f === 'all' ? `All (${couriers.length})` : f}
                </button>
              ))}
            </div>

            {/* Courier cards */}
            <div className="space-y-3">
              {displayed.map((c) => (
                <CourierCard
                  key={c.id}
                  c={c}
                  cheapest={cheapest}
                  fastest={fastest}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </div>

            {/* Selected summary */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 bg-indigo-50 border-2 border-indigo-200"
              >
                <p className="text-sm font-bold text-indigo-800">Selected: {selected.name}</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  ₹{selected.rate} · Delivers in {selected.estimatedDays} day{selected.estimatedDays !== 1 ? 's' : ''}
                  {form.cod && selected.cod && ` (COD +₹${selected.codCharges})`}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {!calcLoading && submitted && couriers.length === 0 && !calcError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card p-8 text-center text-gray-400 text-sm"
          >
            No couriers available for this route.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingCalculator;

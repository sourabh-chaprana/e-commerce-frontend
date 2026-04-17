import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, IndianRupee, Clock, CheckCircle2, Award } from 'lucide-react';

const FILTERS = ['all', 'cheapest', 'fastest'];

/**
 * Displays a filterable list of available couriers.
 * @param {object[]} couriers
 * @param {object}   cheapest
 * @param {object}   fastest
 * @param {function} onSelect(courier) — called when user picks one
 * @param {object}   selected — currently selected courier
 */
const CourierList = ({ couriers = [], cheapest, fastest, onSelect, selected }) => {
  const [filter, setFilter] = useState('all');

  const displayed = filter === 'cheapest'
    ? (cheapest ? [cheapest] : [])
    : filter === 'fastest'
    ? (fastest ? [fastest] : [])
    : couriers;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
              filter === f
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {f === 'all' ? `All (${couriers.length})` : f}
          </button>
        ))}
      </div>

      {/* Courier cards */}
      <div className="space-y-3">
        {displayed.map((c, i) => {
          const isCheapest = cheapest?.id === c.id;
          const isFastest = fastest?.id === c.id;
          const isSelected = selected?.id === c.id;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect?.(c)}
              className={`card p-4 cursor-pointer transition-all border-2 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/60 shadow-indigo-100 shadow-md'
                  : 'border-transparent hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: name + badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-800 text-sm">{c.name}</p>
                    {isCheapest && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <IndianRupee size={10} /> Cheapest
                      </span>
                    )}
                    {isFastest && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <Zap size={10} /> Fastest
                      </span>
                    )}
                    {c.isRecommended && (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        <Award size={10} /> Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {c.estimatedDays} {c.estimatedDays === 1 ? 'day' : 'days'}
                    </span>
                    {c.cod ? (
                      <span className="text-green-600 font-medium">COD Available (+₹{c.codCharges})</span>
                    ) : (
                      <span className="text-gray-400">Prepaid only</span>
                    )}
                  </div>
                </div>

                {/* Right: price + select */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-indigo-600">₹{c.rate}</p>
                    <p className="text-xs text-gray-400">+ taxes</p>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 size={22} className="text-indigo-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {displayed.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No couriers available</p>
        )}
      </div>
    </div>
  );
};

export default CourierList;

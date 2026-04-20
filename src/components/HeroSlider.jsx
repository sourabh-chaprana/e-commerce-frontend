import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DEFAULT_SLIDE = {
  _id: 'default',
  title: 'New Collection 2025',
  subtitle: "WOMEN'S DRESS STORE",
  badge: 'Summer Collection',
  buttonText: 'Shop Now',
  buttonLink: '/',
  image: '',
};

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    api.get('/heroslides').then((r) => setSlides(r.data)).catch(() => setSlides([]));
  }, []);

  const display = slides.length > 0 ? slides : [DEFAULT_SLIDE];

  const next = useCallback(() => setCurrent((c) => (c + 1) % display.length), [display.length]);
  const prev = () => setCurrent((c) => (c - 1 + display.length) % display.length);

  useEffect(() => {
    if (paused || display.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next, display.length]);

  const slide = display[current];

  return (
    <div
      className="relative overflow-hidden min-h-[500px] sm:min-h-[580px] flex items-center select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          {slide.image ? (
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
              <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
              <div
                className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: '1.5s' }}
              />
            </div>
          )}
          {slide.image && <div className="absolute inset-0 bg-black/45" />}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl text-white"
          >
            {slide.badge && (
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/20 uppercase tracking-widest">
                <Sparkles size={11} />
                {slide.badge}
              </span>
            )}
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-4 uppercase tracking-tight drop-shadow-lg">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-base sm:text-lg text-white/80 mb-8 font-medium uppercase tracking-[0.15em]">
                {slide.subtitle}
              </p>
            )}
            <Link
              to={slide.buttonLink || '/'}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-3.5 text-sm uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all duration-200 border-2 border-white hover:border-indigo-500"
            >
              {slide.buttonText || 'Shop Now'}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {display.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {display.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {display.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {display.length > 1 && (
        <div className="absolute bottom-6 right-6 z-20 text-white/60 text-xs font-medium tabular-nums">
          {String(current + 1).padStart(2, '0')} / {String(display.length).padStart(2, '0')}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;

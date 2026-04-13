import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
              <Package size={17} className="text-white" />
            </div>
            <span className="text-lg font-bold">Velvet &amp; Thread</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            Premium garments crafted for the modern individual. Where style meets comfort.
          </p>
          <div className="flex gap-3">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <button
                key={i}
                className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-colors duration-200"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-slate-300 mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {[
              ['Home', '/'],
              ['Men', '/?category=Men'],
              ['Women', '/?category=Women'],
              ['Kids', '/?category=Kids'],
              ['Sale', '/?category=Sale'],
            ].map(([label, path]) => (
              <li key={label}>
                <Link
                  to={path}
                  className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-slate-300 mb-4">Account</h4>
          <ul className="space-y-2.5">
            {[
              ['Login', '/login'],
              ['Register', '/register'],
              ['My Orders', '/orders'],
              ['Cart', '/cart'],
            ].map(([label, path]) => (
              <li key={label}>
                <Link
                  to={path}
                  className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-widest text-slate-300 mb-4">Contact</h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-2.5 text-sm text-slate-400">
              <Mail size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              hello@velvetthread.com
            </li>
            <li className="flex items-start gap-2.5 text-sm text-slate-400">
              <Phone size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              +91 98765 43210
            </li>
            <li className="flex items-start gap-2.5 text-sm text-slate-400">
              <MapPin size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              Mumbai, Maharashtra, India
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">© 2025 Velvet &amp; Thread. All rights reserved.</p>
        <p className="text-xs text-slate-500">Crafted with passion for fashion lovers</p>
      </div>
    </div>
  </footer>
);

export default Footer;

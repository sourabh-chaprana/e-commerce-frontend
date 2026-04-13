import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
];

const SidebarContent = ({ onNavClick, onLogout, user }) => (
  <div className="flex flex-col h-full p-5">
    {/* Logo */}
    <div className="flex items-center gap-3 mb-8 px-1">
      <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <TrendingUp size={17} className="text-white" />
      </div>
      <div>
        <p className="font-extrabold text-white text-sm leading-tight">V&amp;T Admin</p>
        <p className="text-indigo-300 text-xs">CRM Dashboard</p>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 space-y-1">
      {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </nav>

    {/* Store link */}
    <Link
      to="/"
      target="_blank"
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-all mb-2"
    >
      <ExternalLink size={15} />
      View Store
    </Link>

    {/* User info + logout */}
    <div className="border-t border-white/10 pt-4 mt-2">
      <div className="flex items-center gap-3 px-4 py-2 mb-2">
        <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white text-sm font-extrabold shadow flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all w-full"
      >
        <LogOut size={15} />
        Logout
      </button>
    </div>
  </div>
);

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 shadow-2xl flex-shrink-0">
        <SidebarContent
          user={user}
          onNavClick={undefined}
          onLogout={handleLogout}
        />
      </aside>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 shadow-2xl">
            <SidebarContent
              user={user}
              onNavClick={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Velvet &amp; Thread CRM</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-indigo-700">Live</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

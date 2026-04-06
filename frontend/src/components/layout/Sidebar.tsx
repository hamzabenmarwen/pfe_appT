import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  Calendar,
  Users,
  FileText,
  Package,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/admin/catalogue', icon: Utensils, label: 'Catalogue' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
    { to: '/admin/production', icon: ShoppingBag, label: 'Production' },
    { to: '/admin/events', icon: Calendar, label: 'Événements' },
    { to: '/admin/clients', icon: Users, label: 'Clients' },
    { to: '/admin/invoices', icon: FileText, label: 'Factures' },
    { to: '/admin/stock', icon: Package, label: 'Stock' },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-screen z-50 bg-white/85 backdrop-blur-xl transition-all duration-300 flex flex-col shadow-xl border-r border-[var(--secondary-200)] ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-20 flex items-center justify-between px-4 border-b border-[var(--secondary-200)]">
        {!collapsed ? (
          <span className="font-[Playfair_Display] font-bold text-xl tracking-tight text-[var(--secondary-900)]">Traiteur Admin</span>
        ) : (
          <span className="font-[Playfair_Display] font-bold text-xl text-[var(--secondary-900)] mx-auto">TA</span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className="absolute -right-3 top-24 bg-white border border-[var(--secondary-200)] rounded-full p-1.5 text-[var(--secondary-400)] hover:text-[var(--primary-500)] shadow-md z-50 transition-colors"
        onClick={onToggle} 
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-[var(--primary-50)] text-[var(--primary-600)] border border-[var(--primary-200)]' : 'text-[var(--secondary-500)] hover:bg-[var(--secondary-50)] hover:text-[var(--secondary-800)]'}`}
            end={item.to === '/admin'}
          >
            {({ isActive }) => (
               <>
                 <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[var(--primary-100)] text-[var(--primary-600)]' : 'group-hover:bg-[var(--secondary-100)]'}`}>
                    <item.icon size={20} />
                 </div>
                 {!collapsed && <span className="font-semibold whitespace-nowrap overflow-hidden">{item.label}</span>}
               </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--secondary-200)] flex flex-col gap-2">
        <NavLink
          to="/"
          className={`flex items-center gap-3 w-full p-3 rounded-xl text-[var(--secondary-500)] hover:bg-[var(--secondary-50)] hover:text-[var(--secondary-800)] transition-colors ${collapsed ? 'justify-center' : 'justify-start'}`}
          title="Retour au site"
        >
          <div className="p-1.5 rounded-lg">
             <Home size={20} />
          </div>
          {!collapsed && <span className="font-semibold whitespace-nowrap overflow-hidden">Retour au site</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-3 rounded-xl text-[var(--secondary-500)] hover:bg-red-50 hover:text-red-500 transition-colors ${collapsed ? 'justify-center' : 'justify-start'}`}
          title="Déconnexion"
        >
          <div className="p-1.5 rounded-lg">
             <LogOut size={20} />
          </div>
          {!collapsed && <span className="font-semibold whitespace-nowrap overflow-hidden">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

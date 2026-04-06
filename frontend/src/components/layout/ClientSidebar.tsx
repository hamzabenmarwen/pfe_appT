import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ClientSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const ClientSidebar: React.FC<ClientSidebarProps> = ({ collapsed, onToggle }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { to: '/portal', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/portal/orders', icon: ShoppingBag, label: 'Mes commandes' },
    { to: '/portal/events', icon: Calendar, label: 'Mes événements' },
    { to: '/portal/profile', icon: User, label: 'Mon profil' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 bg-[#faf9f8] border-r border-[#d9dae0] transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header / Logo */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-[#d9dae0]">
        {!collapsed ? (
          <div className="flex items-center gap-2 text-[#3f404c]">
            <ChefHat size={28} className="text-[#e8614a]" />
            <span className="font-[Playfair_Display] text-lg font-semibold overflow-hidden whitespace-nowrap">
              Espace Client
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <ChefHat size={28} className="text-[#e8614a]" />
          </div>
        )}
      </div>

      {/* Toggle Button (Absolute positioning based on width) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 bg-white border border-[#d9dae0] rounded-full p-1 text-[#6f7286] hover:text-[#e8614a] shadow-sm z-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 py-8 px-3 flex flex-col gap-2 overflow-y-auto">
        <p className={`text-xs font-semibold text-[#8e91a1] uppercase tracking-[0.2em] mb-2 px-3 ${collapsed ? 'hidden' : 'block'}`}>
          Menu Principal
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/portal'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-[#fde8e1] text-[#e8614a] font-semibold'
                  : 'text-[#6f7286] hover:bg-white hover:text-[#e8614a]'
              }`
            }
          >
            {({ isActive }) => (
               <>
                 <item.icon size={20} className={isActive ? "text-[#e8614a]" : ""} />
                 {!collapsed && <span className="truncate">{item.label}</span>}
               </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User / Logout */}
      <div className="p-4 border-t border-[#d9dae0]">
        {!collapsed && (
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-[#3f404c] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-[#8e91a1] truncate">{user?.email}</p>
          </div>
        )}
        <NavLink
          to="/"
          className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-[#6f7286] hover:bg-gray-100 hover:text-[#3f404c] transition-colors mb-2 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Retour à l'accueil"
        >
          <Home size={20} />
          {!collapsed && <span className="font-medium">Retour à l'accueil</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-[#6f7286] hover:bg-red-50 hover:text-red-500 transition-colors ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Déconnexion"
        >
          <LogOut size={20} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

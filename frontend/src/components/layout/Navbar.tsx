import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ChefHat } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/events', label: 'Événements' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] glass border-b border-white/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-[#3f404c] hover:text-[#e8614a] transition-colors">
            <ChefHat size={32} className="text-[#e8614a]" />
            <span className="font-[Playfair_Display] text-xl md:text-2xl font-semibold">Assiette GA.Ala</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-full ${
                  isActive(link.to)
                    ? 'text-[#e8614a] bg-[#fde8e1]'
                    : 'text-[#6f7286] hover:text-[#e8614a] hover:bg-[#f8f8f9]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-[#6f7286] hover:text-[#e8614a] hover:bg-[#fde8e1] rounded-full transition-all">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#e8614a] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/portal'}
                  className="flex items-center gap-2 px-3 py-2 text-[#6f7286] hover:text-[#e8614a] hover:bg-[#f8f8f9] rounded-full transition-all"
                >
                  <User size={20} />
                  <span className="font-medium text-sm">{user?.firstName}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={LogOut}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Connexion
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Inscription
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#6f7286] hover:text-[#e8614a] hover:bg-[#f8f8f9] rounded-full transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#d9dae0]">
            <div className="flex flex-col gap-2 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    isActive(link.to)
                      ? 'text-[#e8614a] bg-[#fde8e1]'
                      : 'text-[#6f7286] hover:text-[#e8614a] hover:bg-[#f8f8f9]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-[#d9dae0]">
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-[#6f7286] hover:text-[#e8614a] hover:bg-[#f8f8f9] rounded-xl transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Panier
                </span>
                {totalItems > 0 && (
                  <span className="px-2 py-0.5 bg-[#e8614a] text-white text-xs font-bold rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'ADMIN' ? '/admin' : '/portal'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-[#6f7286] hover:text-[#e8614a] hover:bg-[#f8f8f9] rounded-xl transition-all"
                  >
                    <User size={20} />
                    {user?.firstName}
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    leftIcon={LogOut}
                    fullWidth
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    fullWidth
                  >
                    Connexion
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    fullWidth
                  >
                    Inscription
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

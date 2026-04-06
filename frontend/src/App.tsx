import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { useAuth } from './contexts/AuthContext';
import { Role } from './types';

const LandingPage = lazy(() => import('./pages/public/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/public/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const CataloguePage = lazy(() => import('./pages/public/CataloguePage').then((m) => ({ default: m.CataloguePage })));
const PlatDetailPage = lazy(() => import('./pages/public/PlatDetailPage').then((m) => ({ default: m.PlatDetailPage })));
const CartPage = lazy(() => import('./pages/public/CartPage').then((m) => ({ default: m.CartPage })));
const MyOrdersPage = lazy(() => import('./pages/public/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage })));
const ProfilePage = lazy(() => import('./pages/public/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const EventQuotePage = lazy(() => import('./pages/public/EventQuotePage').then((m) => ({ default: m.EventQuotePage })));
const MyEventsPage = lazy(() => import('./pages/public/MyEventsPage').then((m) => ({ default: m.MyEventsPage })));

const ClientLayout = lazy(() => import('./components/layout/ClientLayout').then((m) => ({ default: m.ClientLayout })));
const ClientDashboardPage = lazy(() => import('./pages/client/ClientDashboardPage').then((m) => ({ default: m.ClientDashboardPage })));

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const AdminCataloguePage = lazy(() => import('./pages/admin/CataloguePage').then((m) => ({ default: m.CataloguePage })));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage').then((m) => ({ default: m.OrdersPage })));
const EventsPage = lazy(() => import('./pages/admin/EventsPage').then((m) => ({ default: m.EventsPage })));
const ClientsPage = lazy(() => import('./pages/admin/ClientsPage').then((m) => ({ default: m.ClientsPage })));
const InvoicesPage = lazy(() => import('./pages/admin/InvoicesPage').then((m) => ({ default: m.InvoicesPage })));
const StockPage = lazy(() => import('./pages/admin/StockPage').then((m) => ({ default: m.StockPage })));
const ProductionBoardPage = lazy(() => import('./pages/admin/ProductionBoardPage').then((m) => ({ default: m.ProductionBoardPage })));

const RouteFallback: React.FC = () => <div className="loading-screen">Chargement...</div>;

const renderLazy = (element: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>
    {element}
  </Suspense>
);

// Public Layout
const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col gradient-bg">
    <Navbar />
    <main className="flex-1 pt-20">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Admin Layout
const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  
  return (
    <div className="admin-layout flex h-screen gradient-bg">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={`admin-content flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Admin Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[var(--secondary-200)] flex items-center justify-between px-6 shadow-sm z-10 sticky top-0">
          <h2 className="text-[var(--secondary-800)] font-semibold text-lg hidden md:block">Système de Gestion Central</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--secondary-900)]">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-[var(--secondary-500)]">Administrateur</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-tr from-[var(--primary-600)] to-[var(--primary-400)] rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

// Protected Route for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading-screen">Chargement...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route for admin users only
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="loading-screen">Chargement...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== Role.ADMIN) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1F2937',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={renderLazy(<LandingPage />)} />
          <Route path="/login" element={renderLazy(<LoginPage />)} />
          <Route path="/register" element={renderLazy(<RegisterPage />)} />
          <Route path="/catalogue" element={renderLazy(<CataloguePage />)} />
          <Route path="/plats/:id" element={renderLazy(<PlatDetailPage />)} />
          <Route path="/cart" element={
            <ProtectedRoute>
              {renderLazy(<CartPage />)}
            </ProtectedRoute>
          } />
          {/* Moved portal routes out of PublicLayout */}
        </Route>

        {/* Client Portal Routes */}
        <Route path="/portal" element={
          <ProtectedRoute>
            {renderLazy(<ClientLayout />)}
          </ProtectedRoute>
        }>
          <Route index element={renderLazy(<ClientDashboardPage />)} />
          <Route path="profile" element={renderLazy(<ProfilePage />)} />
          <Route path="orders" element={renderLazy(<MyOrdersPage />)} />
          <Route path="events" element={renderLazy(<MyEventsPage />)} />
        </Route>

        {/* Standalone Route for Event Quotes to not be in the portal or in the portal? It can be in the PublicLayout since it's a form. */}
        <Route element={<PublicLayout />}>
          <Route path="/events/quote" element={
            <ProtectedRoute>
              {renderLazy(<EventQuotePage />)}
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={renderLazy(<DashboardPage />)} />
          <Route path="catalogue" element={renderLazy(<AdminCataloguePage />)} />
          <Route path="orders" element={renderLazy(<OrdersPage />)} />
          <Route path="production" element={renderLazy(<ProductionBoardPage />)} />
          <Route path="events" element={renderLazy(<EventsPage />)} />
          <Route path="clients" element={renderLazy(<ClientsPage />)} />
          <Route path="invoices" element={renderLazy(<InvoicesPage />)} />
          <Route path="stock" element={renderLazy(<StockPage />)} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

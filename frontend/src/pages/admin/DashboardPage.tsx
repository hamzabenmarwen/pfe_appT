import React, { useState, useEffect } from 'react';
import { Package, Users, Calendar, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { analyticsApi, AnalyticsOverview } from '../../services/analytics';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await analyticsApi.getOverview();
      setStats(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Commandes', value: stats?.kpis?.totalOrders || 0, icon: Package, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
    { title: 'Revenus', value: `${(stats?.kpis?.totalRevenue || 0).toFixed(2)} TND`, icon: DollarSign, color: 'var(--primary-700)', bg: 'var(--primary-100)' },
    { title: 'Clients', value: stats?.kpis?.totalClients || 0, icon: Users, color: 'var(--secondary-700)', bg: 'var(--secondary-100)' },
    { title: 'Événements actifs', value: stats?.kpis?.activeEvents || 0, icon: Calendar, color: 'var(--primary-500)', bg: 'var(--primary-50)' },
    { title: 'En attente', value: stats?.kpis?.pendingOrders || 0, icon: Clock, color: '#B45309', bg: '#FEF3C7' },
    { title: 'Stock faible', value: stats?.kpis?.lowStockCount || 0, icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tableau de bord</h1>
          <p className="admin-page-subtitle">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="28px" className="mt-4" />
            </div>
          ))
        ) : (
          statCards.map((card) => (
            <div key={card.title} className="admin-surface admin-kpi-card rounded-2xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bg }}
                >
                  <card.icon size={24} color={card.color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="admin-surface border overflow-hidden rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-[Playfair_Display] text-xl font-bold text-[#1F2937] mb-6">
              Commandes récentes
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} width="100%" height="60px" className="rounded-xl" />
                ))}
              </div>
            ) : stats?.recentOrders?.length ? (
              <div className="space-y-3">
                {stats.recentOrders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-[#fde8e1]/30 transition-colors border border-gray-100/50">
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">
                        #{order.orderNumber}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {order.user?.firstName} {order.user?.lastName} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="font-bold text-[#e8614a]">
                      {order.totalAmount?.toFixed(2)} TND
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-10">
                Aucune commande récente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="admin-surface border overflow-hidden rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-[Playfair_Display] text-xl font-bold text-[#1F2937] mb-6">
              Revenus mensuels
            </h3>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} width="100%" height="40px" className="rounded-xl" />
                ))}
              </div>
            ) : stats?.monthlyRevenue?.length ? (
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.monthlyRevenue}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e8614a" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#e8614a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12 }} 
                      tickFormatter={(value) => `${value} TND`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${Number(value || 0).toFixed(2)} TND`, 'Revenu']}
                      labelStyle={{ color: '#1F2937', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#e8614a" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-10">
                Aucune donnée disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

import apiClient from './api';

// Match the actual backend response shape
export interface AnalyticsOverview {
  kpis: {
    totalOrders: number;
    totalRevenue: number;
    totalClients: number;
    totalPlats: number;
    pendingOrders: number;
    activeEvents: number;
    lowStockCount: number;
  };
  recentOrders: any[];
  monthlyRevenue: { month: string; revenue: number }[];
}

const OVERVIEW_CACHE_TTL_MS = 30_000;

let overviewCache: {
  value: AnalyticsOverview;
  expiresAt: number;
} | null = null;

export const analyticsApi = {
  getOverview: async (opts?: { forceRefresh?: boolean }): Promise<AnalyticsOverview> => {
    const forceRefresh = opts?.forceRefresh === true;
    if (!forceRefresh && overviewCache && Date.now() < overviewCache.expiresAt) {
      return overviewCache.value;
    }

    const response = await apiClient.get('/analytics/overview');
    overviewCache = {
      value: response.data,
      expiresAt: Date.now() + OVERVIEW_CACHE_TTL_MS,
    };
    return response.data;
  },
  
  getRevenue: async (period: 'day' | 'week' | 'month' = 'month'): Promise<any[]> => {
    const response = await apiClient.get('/analytics/revenue', { params: { period } });
    return response.data;
  },
  
  getTopPlats: async (limit: number = 5): Promise<any[]> => {
    const response = await apiClient.get('/analytics/top-plats', { params: { limit } });
    return response.data;
  },
  
  getOrdersByStatus: async (): Promise<{ status: string; label: string; count: number }[]> => {
    const response = await apiClient.get('/analytics/orders-by-status');
    return response.data;
  },
};

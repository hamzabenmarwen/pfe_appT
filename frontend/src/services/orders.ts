import apiClient from './api';
import { Order, OrderStatus, PaginatedResponse, PaginationParams, ProductionBoardData } from '../types';

export interface CreateOrderData {
  items: { platId: string; quantity: number }[];
  deliveryAddress?: string;
  notes?: string;
}

export const ordersApi = {
  getOrders: async (params?: PaginationParams & { status?: OrderStatus }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/orders', { params });
    // Backend returns { orders: [...], pagination: { page, limit, total, totalPages } }
    const raw = response.data;
    return {
      data: raw.orders || [],
      total: raw.pagination?.total || 0,
      page: raw.pagination?.page || 1,
      limit: raw.pagination?.limit || 10,
      totalPages: raw.pagination?.totalPages || 1,
    };
  },
  
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },
  
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },
  
  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  getProductionBoard: async (params?: { mode?: 'active' | 'range'; date?: string; windowDays?: number }): Promise<ProductionBoardData> => {
    const response = await apiClient.get('/orders/production/board', { params });
    return response.data;
  },
};

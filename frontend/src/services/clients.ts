import apiClient from './api';
import { User, PaginatedResponse, PaginationParams } from '../types';

export const clientsApi = {
  getClients: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/clients', { params });
    // Backend returns { clients: [...], pagination: { page, limit, total, totalPages } }
    const raw = response.data;
    return {
      data: raw.clients || [],
      total: raw.pagination?.total || 0,
      page: raw.pagination?.page || 1,
      limit: raw.pagination?.limit || 10,
      totalPages: raw.pagination?.totalPages || 1,
    };
  },
  
  getClientById: async (id: string): Promise<User & { orders: any[]; events: any[] }> => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },
  
  updateLoyaltyPoints: async (id: string, points: number): Promise<User> => {
    const response = await apiClient.put(`/clients/${id}/loyalty`, { points });
    return response.data;
  },

  toggleStatus: async (id: string): Promise<User> => {
    const response = await apiClient.put(`/clients/${id}/toggle-status`);
    return response.data;
  },
};

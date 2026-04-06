import apiClient from './api';
import { Category, Plat, Review, PaginatedResponse, PaginationParams } from '../types';

export const catalogueApi = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
  
  createCategory: async (data: FormData): Promise<Category> => {
    const response = await apiClient.post('/categories', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  updateCategory: async (id: string, data: FormData): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
  
  // Plats
  getPlats: async (params?: PaginationParams & { categoryId?: string; available?: boolean }): Promise<PaginatedResponse<Plat>> => {
    const response = await apiClient.get('/plats', { params });
    // Backend returns { plats: [...], pagination: { page, limit, total, totalPages } }
    const raw = response.data;
    return {
      data: raw.plats || [],
      total: raw.pagination?.total || 0,
      page: raw.pagination?.page || 1,
      limit: raw.pagination?.limit || 12,
      totalPages: raw.pagination?.totalPages || 1,
    };
  },
  
  getPlatById: async (id: string): Promise<Plat> => {
    const response = await apiClient.get(`/plats/${id}`);
    return response.data;
  },
  
  createPlat: async (data: FormData): Promise<Plat> => {
    const response = await apiClient.post('/plats', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  updatePlat: async (id: string, data: FormData): Promise<Plat> => {
    const response = await apiClient.put(`/plats/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  deletePlat: async (id: string): Promise<void> => {
    await apiClient.delete(`/plats/${id}`);
  },
  
  // Reviews
  getReviews: async (platId: string): Promise<Review[]> => {
    const response = await apiClient.get(`/plats/${platId}/reviews`);
    return response.data;
  },
  
  createReview: async (platId: string, data: { rating: number; comment?: string }): Promise<Review> => {
    const response = await apiClient.post(`/plats/${platId}/reviews`, data);
    return response.data;
  },

  // Stock
  getStockLevels: async (): Promise<any[]> => {
    const response = await apiClient.get('/stock');
    return response.data;
  },

  getPurchaseSuggestions: async (params?: { threshold?: number; targetStock?: number }): Promise<any[]> => {
    const response = await apiClient.get('/stock/purchase-suggestions', { params });
    return response.data;
  },

  updateStock: async (id: string, quantity: number): Promise<any> => {
    const response = await apiClient.put(`/stock/${id}`, { quantity });
    return response.data;
  },
};

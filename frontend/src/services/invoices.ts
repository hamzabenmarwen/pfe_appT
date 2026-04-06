import apiClient from './api';
import { Invoice, InvoiceStatus, PaginatedResponse, PaginationParams } from '../types';

export const invoicesApi = {
  getInvoices: async (params?: PaginationParams & { status?: InvoiceStatus }): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiClient.get('/invoices', { params });
    // Backend returns { invoices: [...], pagination: { page, limit, total, totalPages } }
    const raw = response.data;
    return {
      data: raw.invoices || [],
      total: raw.pagination?.total || 0,
      page: raw.pagination?.page || 1,
      limit: raw.pagination?.limit || 10,
      totalPages: raw.pagination?.totalPages || 1,
    };
  },
  
  createFromOrder: async (orderId: string): Promise<Invoice> => {
    const response = await apiClient.post('/invoices/from-order', { orderId });
    return response.data;
  },

  createFromDevis: async (devisId: string): Promise<Invoice> => {
    const response = await apiClient.post('/invoices/from-devis', { devisId });
    return response.data;
  },
  
  markAsPaid: async (id: string): Promise<Invoice> => {
    const response = await apiClient.put(`/invoices/${id}/paid`);
    return response.data;
  },

  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
};

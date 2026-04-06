import apiClient from './api';
import { Event, EventType, Devis, EventStatus, PaginatedResponse, PaginationParams } from '../types';

export interface CreateEventData {
  eventType: EventType;
  title: string;
  eventDate: string;
  guestCount: number;
  venue?: string;
  notes?: string;
  budget?: number;
}

export interface CreateDevisData {
  items: { description: string; quantity: number; unitPrice: number }[];
  validUntil: string;
  notes?: string;
}

export const eventsApi = {
  getEvents: async (params?: PaginationParams & { status?: EventStatus }): Promise<PaginatedResponse<Event>> => {
    const response = await apiClient.get('/events', { params });
    // Backend returns { events: [...], pagination: { page, limit, total, totalPages } }
    const raw = response.data;
    return {
      data: raw.events || [],
      total: raw.pagination?.total || 0,
      page: raw.pagination?.page || 1,
      limit: raw.pagination?.limit || 10,
      totalPages: raw.pagination?.totalPages || 1,
    };
  },
  
  getEventById: async (id: string): Promise<Event> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },
  
  createEvent: async (data: CreateEventData): Promise<Event> => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },
  
  updateEvent: async (id: string, data: Partial<Event>): Promise<Event> => {
    const response = await apiClient.put(`/events/${id}`, data);
    return response.data;
  },

  updateEventStatus: async (id: string, status: EventStatus): Promise<Event> => {
    const response = await apiClient.put(`/events/${id}/status`, { status });
    return response.data;
  },
  
  // Devis
  createDevis: async (eventId: string, data: CreateDevisData): Promise<Devis> => {
    const response = await apiClient.post(`/events/${eventId}/devis`, data);
    return response.data;
  },
  
  sendDevis: async (devisId: string): Promise<Devis> => {
    const response = await apiClient.put(`/events/devis/${devisId}/send`);
    return response.data;
  },
  
  acceptDevis: async (devisId: string): Promise<any> => {
    const response = await apiClient.put(`/events/devis/${devisId}/accept`);
    return response.data;
  },

  rejectDevis: async (devisId: string): Promise<any> => {
    const response = await apiClient.put(`/events/devis/${devisId}/reject`);
    return response.data;
  },
};

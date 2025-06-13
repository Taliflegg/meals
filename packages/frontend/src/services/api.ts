import axios from 'axios';
import { Event, EventsResponse, EventResponse } from '@eventix/shared';
import { useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;
console.log('API_URL loaded from .env:', API_URL);



const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Get all events
  getEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get<EventsResponse>('/events');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch events');
  },

  // Get specific event
  getEvent: async (id: string): Promise<Event> => {
    const response = await apiClient.get<EventResponse>(`/events/${id}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch event');
  },
};




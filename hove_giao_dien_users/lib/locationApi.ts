import { api } from './api';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface LocationResponse {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  updatedAt: string | null;
}

export const locationApi = {
  // Update user's current location
  updateLocation: async (userId: number, location: LocationData): Promise<LocationResponse> => {
    const response = await api.post(`/api/users/${userId}/location`, location);
    return response.data;
  },

  // Get user's current location
  getLocation: async (userId: number): Promise<LocationResponse> => {
    const response = await api.get(`/api/users/${userId}/location`);
    return response.data;
  },
};

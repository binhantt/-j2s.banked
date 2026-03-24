import { api } from './api';

export interface CV {
  id?: number;
  userId: number;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isDefault?: boolean;
  visibility?: 'private' | 'public' | 'application_only';
  createdAt?: string;
  updatedAt?: string;
}

export const cvApi = {
  // Create new CV
  createCV: async (data: Partial<CV>): Promise<CV> => {
    const response = await api.post('/api/user-cvs', data);
    return response.data;
  },

  // Get all CVs for a user
  getUserCVs: async (userId: number): Promise<CV[]> => {
    const response = await api.get(`/api/user-cvs/user/${userId}`);
    return response.data;
  },

  // Get default CV
  getDefaultCV: async (userId: number): Promise<CV> => {
    const response = await api.get(`/api/user-cvs/user/${userId}/default`);
    return response.data;
  },

  // Get CV by ID
  getCV: async (id: number): Promise<CV> => {
    const response = await api.get(`/api/user-cvs/${id}`);
    return response.data;
  },

  // Update CV
  updateCV: async (id: number, data: Partial<CV>): Promise<CV> => {
    const response = await api.put(`/api/user-cvs/${id}`, data);
    return response.data;
  },

  // Update CV privacy/visibility - ONLY owner can do this
  updatePrivacy: async (id: number, userId: number, visibility: 'private' | 'public' | 'application_only'): Promise<CV> => {
    const response = await api.put(`/api/user-cvs/${id}/privacy`, null, {
      params: { userId, visibility },
    });
    return response.data;
  },

  // Generate secure access token for CV viewing
  generateViewToken: async (cvId: number, viewerId: number): Promise<{ token: string; url: string; expiresIn: number }> => {
    const response = await api.post('/api/cv/generate-token', { cvId, viewerId });
    return response.data;
  },

  // Generate access token for private CV viewing
  generateAccessToken: async (cvId: number, userId: number): Promise<{ token: string; expiresIn: number; message: string }> => {
    const response = await api.post('/api/cv/generate-access-token', { cvId, userId });
    return response.data;
  },

  // Generate owner token for CV access
  generateOwnerToken: async (cvId: number, userId: number): Promise<{ 
    token: string; 
    secureUrl: string; 
    fullUrl: string; 
    expiresIn: number; 
    message: string 
  }> => {
    const response = await api.post('/api/cv/generate-owner-token', { cvId, userId });
    return response.data;
  },

  // Generate share link for public CVs only
  generateShareLink: async (cvId: number, userId: number): Promise<{ shareUrl: string; fullUrl: string; message: string }> => {
    const response = await api.post('/api/cv/generate-share-link', { cvId, userId });
    return response.data;
  },

  // Generate HR access token for viewing candidate CVs
  generateHRToken: async (cvId: number, hrId: number, candidateUserId: number): Promise<{ 
    token: string; 
    secureUrl: string; 
    fullUrl: string; 
    expiresIn: number; 
    message: string 
  }> => {
    const response = await api.post('/api/cv/generate-hr-token', { 
      cvId, 
      hrId, 
      candidateUserId 
    });
    return response.data;
  },

  // Generate embed token for secure viewing within application
  generateEmbedToken: async (cvId: number, viewerId: number, accessType: 'OWNER' | 'HR' = 'OWNER'): Promise<{ 
    token: string; 
    embedUrl: string; 
    expiresIn: number; 
    message: string 
  }> => {
    const response = await api.post('/api/cv/generate-embed-token', { 
      cvId, 
      viewerId, 
      accessType 
    });
    return response.data;
  },

  // Build secure CV URL with viewer ID and embed parameters
  buildSecureCVUrl: (filename: string, viewerId: number, token?: string, embed: boolean = true): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    let url = `${baseUrl}/uploads/cv/${filename}?viewerId=${viewerId}&embed=${embed}`;
    if (token) {
      url += `&token=${token}`;
    }
    return url;
  },

  // Set as default
  setAsDefault: async (id: number, userId: number): Promise<void> => {
    await api.put(`/api/user-cvs/${id}/set-default`, null, {
      params: { userId },
    });
  },

  // Delete CV
  deleteCV: async (id: number): Promise<void> => {
    await api.delete(`/api/user-cvs/${id}`);
  },
};

import { api } from './api';

export interface FreelanceProject {
  id?: number;
  title: string;
  description: string;
  clientId: number;
  clientName?: string;
  clientAvatar?: string;
  clientLocation?: string;
  freelancerId?: number;
  freelancerName?: string;
  budget: number;
  depositAmount?: number;
  depositStatus?: 'pending' | 'paid' | 'refunded';
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMilestone {
  id?: number;
  projectId: number;
  title: string;
  description?: string;
  percentage: number;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  completedAt?: string;
}

export interface ProjectProgress {
  id?: number;
  projectId: number;
  freelancerId: number;
  progressPercentage: number;
  description: string;
  attachments?: string[];
  createdAt?: string;
}

export const freelanceApi = {
  // Projects
  getAllProjects: async () => {
    const response = await api.get('/api/freelance/projects');
    return response.data;
  },

  getProject: async (id: number) => {
    const response = await api.get(`/api/freelance/projects/${id}`);
    return response.data;
  },

  getProjectsByClient: async (clientId: number) => {
    const response = await api.get(`/api/freelance/projects/client/${clientId}`);
    return response.data;
  },

  getProjectsByFreelancer: async (freelancerId: number) => {
    const response = await api.get(`/api/freelance/projects/freelancer/${freelancerId}`);
    return response.data;
  },

  createProject: async (data: FreelanceProject) => {
    const response = await api.post('/api/freelance/projects', data);
    return response.data;
  },

  updateProject: async (id: number, data: Partial<FreelanceProject>) => {
    const response = await api.put(`/api/freelance/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: number) => {
    await api.delete(`/api/freelance/projects/${id}`);
  },

  // Progress
  updateProgress: async (projectId: number, data: ProjectProgress) => {
    const response = await api.post(`/api/freelance/projects/${projectId}/progress`, data);
    return response.data;
  },

  getProgressHistory: async (projectId: number) => {
    const response = await api.get(`/api/freelance/projects/${projectId}/progress`);
    return response.data;
  },

  // Payments
  payDeposit: async (projectId: number) => {
    const response = await api.post(`/api/freelance/projects/${projectId}/deposit`);
    return response.data;
  },

  // Client info
  getClientInfo: async (clientId: number) => {
    const response = await api.get(`/api/freelance/clients/${clientId}`);
    return response.data;
  },

  // Milestones
  getMilestonesByProject: async (projectId: number) => {
    const response = await api.get(`/api/freelance/milestones/project/${projectId}`);
    return response.data;
  },

  createMilestone: async (data: {
    projectId: number;
    title: string;
    percentage: number;
    status?: string;
    dueDate?: string;
  }) => {
    const response = await api.post('/api/freelance/milestones', data);
    return response.data;
  },

  updateMilestone: async (id: number, data: any) => {
    const response = await api.put(`/api/freelance/milestones/${id}`, data);
    return response.data;
  },

  deleteMilestone: async (id: number) => {
    await api.delete(`/api/freelance/milestones/${id}`);
  },

  // Applications
  applyToProject: async (data: {
    projectId: number;
    freelancerId: number;
    coverLetter?: string;
    achievements?: string;
    cvUrl?: string;
    proposedPrice?: number;
    estimatedDuration?: number;
  }) => {
    const response = await api.post('/api/freelance/applications', data);
    return response.data;
  },

  getApplicationsByProject: async (projectId: number) => {
    const response = await api.get(`/api/freelance/applications/project/${projectId}`);
    return response.data;
  },

  getFreelancerApplications: async (freelancerId: number) => {
    const response = await api.get(`/api/freelance/applications/freelancer/${freelancerId}`);
    return response.data;
  },

  getApplicationCount: async (projectId: number) => {
    const response = await api.get(`/api/freelance/applications/project/${projectId}/count`);
    return response.data;
  },

  checkApplication: async (projectId: number, freelancerId: number) => {
    const response = await api.get(`/api/freelance/applications/check`, {
      params: { projectId, freelancerId }
    });
    return response.data;
  },

  getProjectApplicants: async (projectId: number) => {
    const response = await api.get(`/api/freelance/applications/project/${projectId}/applicants`);
    return response.data;
  },

  updateApplicationStatus: async (applicationId: number, status: string) => {
    const response = await api.put(`/api/freelance/applications/${applicationId}/status`, {
      status,
    });
    return response.data;
  },

  // Stats
  getClientStats: async (clientId: number) => {
    const response = await api.get(`/api/freelance/projects/client/${clientId}/stats`);
    return response.data;
  },
};

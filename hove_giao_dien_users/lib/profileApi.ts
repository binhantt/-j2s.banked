import { api } from './api';

// Job Seeker Profile APIs
export const jobSeekerProfileApi = {
  getProfile: async (userId: number) => {
    const response = await api.get(`/api/profile/job-seeker/${userId}`);
    return response.data;
  },
  
  createProfile: async (data: any) => {
    const response = await api.post('/api/profile/job-seeker', data);
    return response.data;
  },
  
  updateProfile: async (id: number, data: any) => {
    const response = await api.put(`/api/profile/job-seeker/${id}`, data);
    return response.data;
  },
};

// HR Profile APIs
export const hrProfileApi = {
  getProfile: async (userId: number) => {
    const response = await api.get(`/api/profile/hr/${userId}`);
    return response.data;
  },
  
  createProfile: async (data: any) => {
    const response = await api.post('/api/profile/hr', data);
    return response.data;
  },
  
  updateProfile: async (id: number, data: any) => {
    const response = await api.put(`/api/profile/hr/${id}`, data);
    return response.data;
  },
};

// Skills APIs
export const skillsApi = {
  getSkills: async (userId: number) => {
    const response = await api.get(`/api/profile/skills/${userId}`);
    return response.data;
  },
  
  createSkill: async (data: any) => {
    const response = await api.post('/api/profile/skills', data);
    return response.data;
  },
  
  deleteSkill: async (id: number) => {
    await api.delete(`/api/profile/skills/${id}`);
  },
};

// Experience APIs
export const experienceApi = {
  getExperiences: async (userId: number) => {
    const response = await api.get(`/api/profile/experience/${userId}`);
    return response.data;
  },
  
  createExperience: async (data: any) => {
    const response = await api.post('/api/profile/experience', data);
    return response.data;
  },
  
  updateExperience: async (id: number, data: any) => {
    const response = await api.put(`/api/profile/experience/${id}`, data);
    return response.data;
  },
  
  deleteExperience: async (id: number) => {
    await api.delete(`/api/profile/experience/${id}`);
  },
};

// Education APIs
export const educationApi = {
  getEducations: async (userId: number) => {
    const response = await api.get(`/api/profile/education/${userId}`);
    return response.data;
  },
  
  createEducation: async (data: any) => {
    const response = await api.post('/api/profile/education', data);
    return response.data;
  },
  
  updateEducation: async (id: number, data: any) => {
    const response = await api.put(`/api/profile/education/${id}`, data);
    return response.data;
  },
  
  deleteEducation: async (id: number) => {
    await api.delete(`/api/profile/education/${id}`);
  },
};

// CV APIs
export const cvApi = {
  getCVs: async (userId: number) => {
    const response = await api.get(`/api/profile/cv/${userId}`);
    return response.data;
  },
  
  createCV: async (data: any) => {
    const response = await api.post('/api/profile/cv', data);
    return response.data;
  },
  
  updateCV: async (id: number, data: any) => {
    const response = await api.put(`/api/profile/cv/${id}`, data);
    return response.data;
  },
  
  setActiveCV: async (id: number) => {
    const response = await api.put(`/api/profile/cv/${id}/set-active`);
    return response.data;
  },
  
  deleteCV: async (id: number) => {
    await api.delete(`/api/profile/cv/${id}`);
  },
};

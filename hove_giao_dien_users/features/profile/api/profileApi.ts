import { api } from '@/lib/api';

export interface CompanyProfile {
  id: number;
  hrId: number;
  name: string;
  logoUrl?: string;
  domainId?: number;
  companySize?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  mission?: string;
  vision?: string;
  values?: string;
  benefits?: string;
  workingHours?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobSeekerProfile {
  id: number;
  userId: number;
  phone?: string;
  location?: string;
  bio?: string;
  currentPosition?: string;
  hometown?: string;
  currentLocation?: string;
  certificateImages?: string;
  domainId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const profileApi = {
  // Company Profile APIs
  async getCompanyByHrId(hrId: number): Promise<CompanyProfile | null> {
    try {
      const response = await api.get<CompanyProfile>(`/api/companies/hr/${hrId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Lỗi khi tải company profile (HR):', error?.response?.data || error?.message);
      return null;
    }
  },

  async createCompany(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    try {
      const response = await api.post<CompanyProfile>('/api/companies', data);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Tạo công ty thất bại';
      console.error('❌ Lỗi tạo công ty:', msg);
      throw new Error(msg);
    }
  },

  async updateCompany(id: number, data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    try {
      const response = await api.put<CompanyProfile>(`/api/companies/${id}`, data);
      return response.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Cập nhật công ty thất bại';
      console.error('❌ Lỗi cập nhật công ty:', msg);
      throw new Error(msg);
    }
  },

  // Job Seeker Profile APIs
  async getJobSeekerProfile(userId: number): Promise<JobSeekerProfile> {
    const response = await api.get<JobSeekerProfile>(`/api/profile/job-seeker/${userId}`);
    return response.data;
  },

  async createJobSeekerProfile(data: Partial<JobSeekerProfile>): Promise<JobSeekerProfile> {
    const response = await api.post<JobSeekerProfile>('/api/profile/job-seeker', data);
    return response.data;
  },

  async updateJobSeekerProfile(userId: number, data: Partial<JobSeekerProfile>): Promise<JobSeekerProfile> {
    const response = await api.put<JobSeekerProfile>(`/api/profile/job-seeker-profiles/by-user/${userId}`, data);
    return response.data;
  },
};

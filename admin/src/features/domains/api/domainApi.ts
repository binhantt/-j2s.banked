import { httpRequest } from '../../../shared/api/httpClient';
import type { Domain, DomainSummary, CreateDomainPayload, UpdateDomainPayload } from '../types/domainTypes';

export const domainApi = {
  async getDomains(): Promise<DomainSummary[]> {
    try {
      const data = await httpRequest<Domain[]>('/domains');
      return data.map(domain => ({
        id: domain.id,
        name: domain.name,
        description: domain.description,
        isActive: domain.isActive,
        jobCount: domain.jobCount || 0,
        createdAt: domain.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching domains:', error);
      throw new Error('Không thể tải danh sách lĩnh vực');
    }
  },

  async getDomainById(id: string): Promise<Domain> {
    try {
      return await httpRequest<Domain>(`/domains/${id}`);
    } catch (error) {
      console.error('Error fetching domain:', error);
      throw new Error('Không thể tải thông tin lĩnh vực');
    }
  },

  async createDomain(payload: CreateDomainPayload): Promise<Domain> {
    try {
      const data = {
        name: payload.name,
        description: payload.description || null,
        isActive: payload.isActive ?? true,
      };
      
      console.log('Creating domain:', data);
      
      return await httpRequest<Domain>('/domains', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error creating domain:', error);
      throw new Error('Không thể tạo lĩnh vực');
    }
  },

  async updateDomain(payload: UpdateDomainPayload): Promise<Domain> {
    try {
      const data = {
        name: payload.name,
        description: payload.description || null,
        isActive: payload.isActive ?? true,
      };
      
      console.log('Updating domain:', data);
      
      return await httpRequest<Domain>(`/domains/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating domain:', error);
      throw new Error('Không thể cập nhật lĩnh vực');
    }
  },

  async deleteDomain(id: string): Promise<void> {
    try {
      console.log('Deleting domain:', id);
      await httpRequest<void>(`/domains/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting domain:', error);
      throw new Error('Không thể xóa lĩnh vực');
    }
  },

  async toggleDomainStatus(id: string, isActive: boolean): Promise<void> {
    try {
      console.log('Toggling domain status:', id, isActive);
      await httpRequest<void>(`/domains/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
    } catch (error) {
      console.error('Error toggling domain status:', error);
      throw new Error('Không thể thay đổi trạng thái lĩnh vực');
    }
  },
};
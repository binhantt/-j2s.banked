export interface Domain {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobCount?: number; // Số lượng công việc trong lĩnh vực này
}

export interface CreateDomainPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDomainPayload extends CreateDomainPayload {
  id: string;
}

export interface DomainSummary {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  jobCount: number;
  createdAt: string;
}
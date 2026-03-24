# Types + API

## Types
```ts
// src/features/domains/types/domainTypes.ts
export interface Domain {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jobCount?: number;
}

export interface DomainSummary {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  jobCount: number;
  createdAt: string;
}

export interface CreateDomainPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDomainPayload extends CreateDomainPayload {
  id: string;
}
```

## API — getDomains
```ts
// src/features/domains/api/domainApi.ts
async getDomains(): Promise<DomainSummary[]> {
  const data = await httpRequest<Domain[]>('/domains');
  return data.map(domain => ({
    id: domain.id,
    name: domain.name,
    description: domain.description,
    isActive: domain.isActive,
    jobCount: domain.jobCount || 0,
    createdAt: domain.createdAt,
  }));
}
```

## API endpoints đầy đủ

| Hành động | Method | Endpoint |
|-----------|--------|---------|
| Lấy danh sách | GET | `/domains` |
| Lấy chi tiết | GET | `/domains/{id}` |
| Tạo mới | POST | `/domains` |
| Cập nhật | PUT | `/domains/{id}` |
| Xóa | DELETE | `/domains/{id}` |
| Toggle trạng thái | PATCH | `/domains/{id}/status` |

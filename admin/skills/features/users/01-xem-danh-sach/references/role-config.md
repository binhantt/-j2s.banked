# Role — Label & Color

```tsx
// src/features/users/pages/UserManagementPage.tsx

const roleLabel: Record<AccountRole, string> = {
  job_seeker: 'Ứng viên',
  freelancer: 'Freelancer',
  hr: 'Nhà tuyển dụng',
  admin: 'Admin hệ thống',
  super_admin: 'Super Admin',
  moderator: 'Kiểm duyệt viên',
  support: 'CSKH / Support',
};

const roleColor: Record<AccountRole, string> = {
  job_seeker: 'green',
  freelancer: 'lime',
  hr: 'cyan',
  admin: 'gold',
  super_admin: 'red',
  moderator: 'purple',
  support: 'blue',
};
```

## Bảng tổng hợp

| Role | Label | Màu | Nhóm |
|------|-------|------|------|
| `job_seeker` | Ứng viên | green | user |
| `freelancer` | Freelancer | lime | user |
| `hr` | Nhà tuyển dụng | cyan | user |
| `admin` | Admin hệ thống | gold | backend |
| `super_admin` | Super Admin | red | backend |
| `moderator` | Kiểm duyệt viên | purple | backend |
| `support` | CSKH / Support | blue | backend |

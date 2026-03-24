# API — GET /admin/users

## Endpoint
```
GET /admin/users
```

## Mapping: UserResponse → UserAdminRow

```ts
// src/features/users/store/useUsersStore.ts
function convertToUserAdminRow(user: UserResponse): UserAdminRow {
  let group: 'user' | 'backend' = 'user';
  let role: UserAdminRow['role'] = 'job_seeker';

  if (user.userType === 'job_seeker') {
    role = 'job_seeker';
  } else if (user.userType === 'freelancer') {
    role = 'freelancer';
  } else if (user.userType === 'hr') {
    role = 'hr';
  } else if (user.userType === 'admin') {
    group = 'backend'; role = 'admin';
  } else if (user.userType === 'super_admin') {
    group = 'backend'; role = 'super_admin';
  } else if (user.userType === 'moderator') {
    group = 'backend'; role = 'moderator';
  } else if (user.userType === 'support') {
    group = 'backend'; role = 'support';
  }

  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    group,
    role,
    isActive: user.isActive,
    lastLogin: user.updatedAt
      ? new Date(user.updatedAt).toLocaleDateString('vi-VN')
      : 'Chưa có',
    createdAt: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('vi-VN')
      : '',
  };
}
```

## Bảng mapping

| UserResponse | → | UserAdminRow |
|---|---|---|
| `id` | → | `id` |
| `name` | → | `fullName` |
| `email` | → | `email` |
| `userType` | → | `role` + `group` |
| `isActive` | → | `isActive` |
| `updatedAt` | → | `lastLogin` (dd/mm/yyyy) |
| `createdAt` | → | `createdAt` (dd/mm/yyyy) |

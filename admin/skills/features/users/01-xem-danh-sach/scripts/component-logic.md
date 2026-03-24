# Component — gọi fetch + filter + stats

```tsx
// src/features/users/pages/UserManagementPage.tsx

// Gọi fetch khi mount
const { users, loading, fetchUsers } = useUsersStore();

useEffect(() => {
  void fetchUsers().catch(() => {
    message.error('Không tải được danh sách tài khoản');
  });
}, [fetchUsers]);

// Filter logic
const filteredUsers = useMemo(() => {
  return users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = user.group === groupFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesGroup && matchesRole;
  });
}, [users, search, groupFilter, roleFilter]);

// Stats
const stats = useMemo(() => {
  const backend = users.filter((u) => u.group === 'backend');
  const user = users.filter((u) => u.group === 'user');
  return {
    backendTotal: backend.length,
    backendActive: backend.filter((u) => u.isActive).length,
    userTotal: user.length,
    userActive: user.filter((u) => u.isActive).length,
  };
}, [users]);
```

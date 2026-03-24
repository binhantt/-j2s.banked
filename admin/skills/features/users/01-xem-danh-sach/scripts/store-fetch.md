# Store — fetchUsers

```ts
// src/features/users/store/useUsersStore.ts
fetchUsers: async () => {
  set({ loading: true, error: null });
  try {
    const data = await userApi.getAllUsers();
    const users = data.map(convertToUserAdminRow);
    set({ users, loading: false });
  } catch (error) {
    set({
      loading: false,
      error: error instanceof Error ? error.message : 'Không tải được danh sách người dùng',
    });
    throw error;
  }
}
```

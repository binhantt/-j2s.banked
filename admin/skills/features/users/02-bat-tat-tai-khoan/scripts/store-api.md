# Store — setUserActive

```ts
// src/features/users/store/useUsersStore.ts
setUserActive: async (id: number, isActive: boolean) => {
  try {
    if (isActive) {
      await userApi.activateUser(id);
    } else {
      await userApi.deactivateUser(id);
    }
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, isActive } : user
      ),
    }));
  } catch (error) {
    set({
      error: error instanceof Error
        ? error.message
        : 'Không thể cập nhật trạng thái người dùng',
    });
    throw error;
  }
}
```

## API — activateUser
```ts
// src/features/users/api/userApi.ts
async activateUser(id: number): Promise<UserResponse> {
  return httpRequest<UserResponse>(`/admin/users/${id}/activate`, {
    method: 'PUT',
  });
}
```

## API — deactivateUser
```ts
async deactivateUser(id: number): Promise<UserResponse> {
  return httpRequest<UserResponse>(`/admin/users/${id}/deactivate`, {
    method: 'PUT',
  });
}
```

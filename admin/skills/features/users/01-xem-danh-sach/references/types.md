# Types — User

## AccountGroup
```ts
export type AccountGroup = 'user' | 'backend';
```

## AccountRole
```ts
export type AccountRole =
  | 'job_seeker'
  | 'freelancer'
  | 'hr'
  | 'admin'
  | 'super_admin'
  | 'moderator'
  | 'support';
```

## UserAdminRow
```ts
export interface UserAdminRow {
  id: number;
  fullName: string;
  email: string;
  group: AccountGroup;
  role: AccountRole;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}
```

## UserResponse (từ API)
```ts
export interface UserResponse {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: string;
  userType: string;
  phone?: string;
  currentPosition?: string;
  hometown?: string;
  currentLocation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

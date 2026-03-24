# References

Thư mục chứa tài liệu tham khảo cho dự án Hove Giao Dien Users.

## Cấu trúc

```
references/
├── README.md              ← File này
├── api-reference.md      ← Tài liệu API đầy đủ
├── components.md         ← Tài liệu components
├── permissions.md        ← Hướng dẫn phân quyền
├── stores.md             ← Tài liệu Zustand stores
├── hooks.md              ← Tài liệu custom hooks
└── style-guide.md        ← Hướng dẫn style code
```

## Các file tài liệu

### api-reference.md
- Tất cả API endpoints
- Request/Response examples
- Error handling
- Rate limiting

### components.md
- Layout components
- Common components
- Form components
- Feature components
- Styling guide

### permissions.md
- User types (job_seeker, freelancer, hr)
- Permissions matrix
- Cách sử dụng usePermissions hook
- ProtectedRoute component

### stores.md
- Zustand stores documentation
- useAuthStore
- useJobStore
- useCompanyStore
- useBlogStore

### hooks.md
- Custom hooks documentation
- usePermissions
- useCompanyWithDomain

### style-guide.md
- Code style conventions
- Naming conventions
- Best practices
- TypeScript patterns
- ESLint & Prettier config

## Cách đọc tài liệu

1. **Bắt đầu với permissions.md** - Hiểu hệ thống phân quyền
2. **Đọc api-reference.md** - Biết cách gọi API
3. **Tham khảo components.md** - Sử dụng đúng components
4. **Xem stores.md và hooks.md** - Quản lý state
5. **Follow style-guide.md** - Viết code nhất quán

## Cập nhật tài liệu

Khi có thay đổi trong codebase:
1. Cập nhật tài liệu liên quan
2. Thêm ghi chú ở đầu file với ngày cập nhật
3. Nếu có breaking changes, thêm phần "Migration Guide"

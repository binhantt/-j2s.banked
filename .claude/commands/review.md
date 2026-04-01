# /review — Code Review

## Mô tả
Review code mới được thêm hoặc thay đổi.

## Quy trình

### 1. Xác định scope
- Đọc các file đã thay đổi (git diff hoặc chỉ định files)
- Xác định feature/fix đang làm gì

### 2. Review checklist

#### Backend (Spring Boot)
- [ ] Tuân thủ Clean Architecture?
- [ ] Validation đầy đủ?
- [ ] Error handling có GlobalExceptionHandler?
- [ ] Repository query có N+1 problem?
- [ ] Transaction annotation đúng?
- [ ] Security: endpoint có quyền hạn đúng?
- [ ] Rate limit được áp dụng?
- [ ] API response format nhất quán?

#### Frontend (Next.js)
- [ ] Component có prop types?
- [ ] State management đúng (Zustand/TanStack Query)?
- [ ] Error handling cho API calls?
- [ ] Loading/empty states?
- [ ] Debounce cho search?
- [ ] Polling cleanup (useEffect return)?
- [ ] Auth guard cho protected routes?

#### Admin (React)
- [ ] Zustand store có persist đúng?
- [ ] HTTP client có Bearer token?
- [ ] Error handling với BannedException?
- [ ] Theme/UI nhất quán với rest of app?

### 3. Kiểm tra vấn đề chung
- [ ] Security: không hardcode credentials, không expose sensitive data
- [ ] Performance: không có unnecessary re-renders
- [ ] Maintainability: code có clean, dễ đọc?
- [ ] Naming conventions: có nhất quán?

### 4. Feedback
- **MUST FIX:** Lỗi nghiêm trọng, security, breaking bug
- **SHOULD FIX:** Nên sửa, improve quality
- **NICE TO HAVE:** Cải thiện optional

## Output
```
## Code Review: [Feature/Issue]

### Files changed
- file1.java
- file2.tsx

### Must Fix
- ...

### Should Fix
- ...

### Nice to Have
- ...

### Summary
...
```

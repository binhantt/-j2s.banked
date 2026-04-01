# /fix-issue — Sửa lỗi cụ thể

## Mô tả
Phân tích và sửa lỗi được mô tả bởi người dùng.

## Quy trình

### Bước 1: Xác định lỗi
- Hỏi người dùng mô tả lỗi (error message, screenshot, steps to reproduce)
- Xác định lỗi xảy ra ở layer nào: Backend / Frontend User / Admin / Database

### Bước 2: Tìm root cause
- Backend: Kiểm tra Controller, Service, Repository, logs
- Frontend: Kiểm tra API call, interceptor, state, console errors
- Database: Kiểm tra query, connection, data integrity

### Bước 3: Sửa lỗi
- Áp dụng fix với nguyên tắc: thay đổi tối thiểu, không phá vỡ chức năng khác
- Nếu cần sửa nhiều files, sửa lần lượt và test sau mỗi bước

### Bước 4: Kiểm tra
- Build lại project
- Test lại luồng bị lỗi
- Test các luồng liên quan không bị ảnh hưởng

## Ví dụ
```
/fix-issue Lỗi 500 khi gọi API /api/jobs/search
→ Kiểm tra JobPostingController.searchJobs()
→ Phát hiện N+1 query → tối ưu với JOIN FETCH
→ Test lại search
```

## Output
- Mô tả lỗi gốc
- Nguyên nhân root cause
- File(s) đã sửa
- Cách test sau sửa

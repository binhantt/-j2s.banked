
# Scripts

Thư mục chứa các script tự động hóa cho dự án Hove Giao Dien Users.

## Cấu trúc

```
scripts/
├── README.md              ← File này
├── form_validation.py    ← Validation dữ liệu form
├── build.sh              ← Script build dự án
├── deploy.sh             ← Script deploy
└── ...
```

## Cách sử dụng

### Python Scripts

```bash
# Di chuyển vào thư mục scripts
cd toantaduan/scripts

# Chạy script validation
python form_validation.py
```

### Shell Scripts

```bash
# Cấp quyền执行
chmod +x build.sh

# Chạy script
./build.sh
```

## Scripts có sẵn

### form_validation.py

Script validation dữ liệu form cho dự án.

**Validators:**
- `required` - Bắt buộc
- `email` - Email hợp lệ
- `phone` - SĐT Việt Nam
- `min_length(n)` - Tối thiểu n ký tự
- `max_length(n)` - Tối đa n ký tự
- `numeric` - Phải là số
- `url` - URL hợp lệ

**Pre-built Rules:**
```python
job_posting_rules()      # Đăng tin tuyển dụng
user_profile_rules()     # Profile user
blog_post_rules()        # Đăng blog
freelance_project_rules() # Dự án freelance
```

**Ví dụ:**
```python
from form_validation import FormValidator, user_profile_rules

validator = FormValidator()
data = {
    "name": "Nguyen Van A",
    "email": "test@example.com",
    "phone": "0912345678"
}

try:
    validator.validate(data, user_profile_rules())
    print("✅ Validation passed")
except ValidationError as e:
    print(f"❌ {e}")
```

## Tạo script mới

### Python Script

```python
#!/usr/bin/env python3
"""
Mô tả script
"""

def main():
    print("Hello World")

if __name__ == "__main__":
    main()
```

### Shell Script

```bash
#!/bin/bash
# Mô tả script

echo "Building project..."
npm run build
```

## Environment Variables

Một số script cần environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
```

## Chú ý

- Luôn kiểm tra đường dẫn trước khi chạy
- Backup dữ liệu trước khi chạy script deploy
- Đọc kỹ source code trước khi chạy script lạ

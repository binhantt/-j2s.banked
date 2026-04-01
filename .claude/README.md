# Hướng dẫn sử dụng Claude Code cho dự án Việc Làm 24h

## Cấu trúc thư mục

```
d:/DOANJ2/
├── .claude/                    # Cấu hình Claude Code
│   ├── agents/                 # Định nghĩa agent tùy chỉnh
│   ├── commands/                # Slash commands
│   ├── rules/                  # Quy tắc code conventions
│   ├── skills/                 # Skills documentation
│   ├── settings.json           # Cấu hình toàn cục
│   ├── settings.local.json     # Cấu hình local
│   ├── CLAUDE.md              # Mô tả dự án
│   └── CLAUDE.local.md        # Ghi chú local
│
├── bankend_hovan_J2/           # Backend Spring Boot
├── hove_giao_dien_users/       # Frontend User Next.js
├── admin/                      # Admin Dashboard React
└── TONG_HOP_LOGIC_NGHIEP_VU.md # Tổng hợp logic nghiệp vụ
```

## Commands có sẵn

| Command | Mô tả |
|---|---|
| `/deploy` | Triển khai hệ thống |
| `/fix-issue` | Sửa lỗi cụ thể |
| `/review` | Code review |

## Rules

- `api-conventions.md` — Quy ước REST API
- `code-style.md` — Code style conventions
- `database.md` — Quy tắc database
- `error-handling.md` — Xử lý lỗi
- `git-workflow.md` — Quy trình Git
- `project-structure.md` — Cấu trúc project
- `security.md` — Bảo mật
- `testing.md` — Testing

## Skills

- `deploy/` — Hướng dẫn deploy
- `security-review/` — Review bảo mật

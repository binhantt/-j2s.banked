# AP-04: Cập nhật trạng thái đơn

## Mô tả ngắn
HR cập nhật trạng thái đơn (pending → reviewing → accepted/rejected) và quản lý vòng phỏng vấn.

## Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| PUT | `/api/applications/{id}/status` | Cập nhật trạng thái |
| PUT | `/api/applications/{id}/round` | Cập nhật vòng phỏng vấn |
| PUT | `/api/applications/{id}/confirm` | Ứng viên xác nhận đi làm |

## Trạng thái đơn

| Status | Mô tả | Ai thay đổi |
|--------|-------|------------|
| `pending` | Chờ duyệt | Auto khi nộp |
| `reviewing` | Đang xem xét | HR |
| `accepted` | Nhận tuyển | HR (UseCase + notification) |
| `rejected` | Từ chối | HR (UseCase + notification) |

## Update Status — Request Body
```json
{
  "status": "reviewing"
}
```

## Luồng xử lý

```
PUT /api/applications/{id}/status
→ applicationRepository.findById(id)
  → not found → 404
→ status == "accepted" || status == "rejected"?
  → updateApplicationStatusUseCase.execute(id, status)
    → notification được tạo
  → reload entity
: → app.setStatus(status); save()
→ ResponseEntity.ok(saved)
```

## Update Round — Request Body
```json
{
  "action": "pass"  // hoặc "fail"
}
```

## Luồng xử lý Round

```
PUT /api/applications/{id}/round
→ action == "pass":
  → currentRound < totalRounds?
    → app.setCurrentRound(newRound)
    → app.setStatus("reviewing")
    → updateApplicationStatusUseCase.executeRoundUpdate(id, round, total, jobTitle)
  → else → return 400 "Ứng viên đã hoàn thành tất cả vòng"
→ action == "fail":
  → app.setStatus("rejected")
  → updateApplicationStatusUseCase.execute(id, "rejected")
→ ResponseEntity.ok(saved)
```

## User Confirm
```
PUT /api/applications/{id}/confirm
→ app.getStatus() == "accepted"?
  → app.setUserConfirmed(true); save()
  → else → return 400
→ ResponseEntity.ok(confirmedApp)
```

## Tác vụ
- [x] Update trạng thái (reviewing, pending...)
- [x] Accept/Reject → UseCase tạo notification
- [x] Pass round → tăng currentRound + notification
- [x] Fail round → rejected + notification
- [x] User confirm đi làm

## Cách sử dụng code trong thư mục

### `scripts/`
- Controller: PUT /api/applications/{id}/status, /round, /confirm
- UseCase: UpdateApplicationStatusUseCase.execute()
- Round logic: jobPostingRepository.findById(jobId) → getInterviewRounds()

### `references/`
- Entity: JobApplicationEntityJpa
- Fields: status, currentRound, userConfirmed
- UseCase: UpdateApplicationStatusUseCase
- Notification: được tạo trong UseCase

## Ràng buộc
- accepted/rejected → phải qua UseCase để tạo notification
- pass/fail round cần so sánh currentRound vs interviewRounds
- user confirm chỉ khi status == "accepted"

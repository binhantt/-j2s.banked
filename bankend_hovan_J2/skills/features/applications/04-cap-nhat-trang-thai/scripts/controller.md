# Controller — Cập nhật trạng thái đơn

## Update Status
```java
// PUT /api/applications/{id}/status
@PutMapping("/{id}/status")
public ResponseEntity<?> updateStatus(
        @PathVariable Long id,
        @RequestBody StatusUpdateRequest request) {
    return applicationRepository.findById(id)
            .map(app -> {
                JobApplicationEntityJpa saved;

                // accepted/rejected → UseCase tạo notification
                if ("accepted".equals(request.getStatus()) || "rejected".equals(request.getStatus())) {
                    updateApplicationStatusUseCase.execute(id, request.getStatus());
                    saved = applicationRepository.findById(id).orElse(app);
                } else {
                    app.setStatus(request.getStatus());
                    saved = applicationRepository.save(app);
                }

                return ResponseEntity.ok(saved);
            })
            .orElse(ResponseEntity.notFound().build());
}
```

## Update Round
```java
// PUT /api/applications/{id}/round
@PutMapping("/{id}/round")
public ResponseEntity<?> updateRound(
        @PathVariable Long id,
        @RequestBody RoundUpdateRequest request) {
    return applicationRepository.findById(id)
            .map(app -> {
                return jobPostingRepository.findById(app.getJobPostingId())
                        .map(job -> {
                            int currentRound = app.getCurrentRound() != null ? app.getCurrentRound() : 0;
                            int totalRounds = job.getInterviewRounds() != null ? job.getInterviewRounds() : 1;

                            if ("pass".equals(request.getAction())) {
                                if (currentRound >= totalRounds) {
                                    return ResponseEntity.badRequest()
                                            .body(Map.of("error", "Ứng viên đã hoàn thành tất cả vòng phỏng vấn"));
                                }
                                int newRound = currentRound + 1;
                                app.setCurrentRound(newRound);
                                app.setStatus("reviewing");
                                JobApplicationEntityJpa saved = applicationRepository.save(app);
                                updateApplicationStatusUseCase.executeRoundUpdate(
                                    id, Integer.valueOf(newRound), Integer.valueOf(totalRounds), job.getTitle()
                                );
                                return ResponseEntity.ok(saved);
                            } else if ("fail".equals(request.getAction())) {
                                app.setStatus("rejected");
                                JobApplicationEntityJpa saved = applicationRepository.save(app);
                                updateApplicationStatusUseCase.execute(id, "rejected");
                                return ResponseEntity.ok(saved);
                            }
                            return ResponseEntity.badRequest().body(Map.of("error", "Invalid action"));
                        })
                        .orElse(ResponseEntity.notFound().build());
            })
            .orElse(ResponseEntity.notFound().build());
}
```

## User Confirm
```java
// PUT /api/applications/{id}/confirm
@PutMapping("/{id}/confirm")
public ResponseEntity<?> confirmApplication(@PathVariable Long id) {
    return applicationRepository.findById(id)
            .map(app -> {
                if (!"accepted".equals(app.getStatus())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Chỉ có thể xác nhận khi đơn đã được chấp nhận"));
                }
                app.setUserConfirmed(true);
                return ResponseEntity.ok(applicationRepository.save(app));
            })
            .orElse(ResponseEntity.notFound().build());
}
```

## Request DTOs
```java
class StatusUpdateRequest {
    private String status; // pending, reviewing, accepted, rejected
}

class RoundUpdateRequest {
    private String action; // "pass" or "fail"
}
```

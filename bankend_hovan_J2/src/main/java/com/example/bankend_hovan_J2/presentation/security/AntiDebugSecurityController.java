package com.example.bankend_hovan_J2.presentation.security;

import com.example.bankend_hovan_J2.infrastructure.security.AntiDebugGuardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/security/anti-debug")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class AntiDebugSecurityController {

    private final AntiDebugGuardService antiDebugGuardService;

    @PostMapping("/report")
    public ResponseEntity<Map<String, Object>> reportViolation(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body) {

        String app = getString(body, "app", "unknown");
        String route = getString(body, "route", "unknown");
        String event = getString(body, "event", "unknown");
        String fingerprint = getString(body, "fingerprint", "anon");
        String clientIp = extractClientIp(request);
        String actorKey = buildActorKey(clientIp, fingerprint, app);

        AntiDebugGuardService.GuardResult result = antiDebugGuardService.reportViolation(
            actorKey,
            app,
            route,
            event,
            clientIp,
            fingerprint
        );

        log.warn("[ANTI_DEBUG] report app={} route={} event={} key={} locked={} remaining={}s",
                app, route, event, actorKey, result.locked(), result.lockRemainingSeconds());

        return ResponseEntity.ok(Map.of(
                "locked", result.locked(),
                "lockRemainingSeconds", result.lockRemainingSeconds()
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(
            HttpServletRequest request,
            @RequestParam(name = "app", defaultValue = "unknown") String app,
            @RequestParam(name = "fingerprint", defaultValue = "anon") String fingerprint) {

        String actorKey = buildActorKey(extractClientIp(request), fingerprint, app);
        AntiDebugGuardService.GuardResult result = antiDebugGuardService.getStatus(actorKey);

        return ResponseEntity.ok(Map.of(
                "locked", result.locked(),
                "lockRemainingSeconds", result.lockRemainingSeconds()
        ));
    }

    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> events(
            @RequestParam(name = "app", required = false) String app,
            @RequestParam(name = "limit", defaultValue = "100") int limit) {

        List<AntiDebugGuardService.AuditEvent> events = antiDebugGuardService.getRecentEvents(app, limit);
        return ResponseEntity.ok(Map.of(
                "count", events.size(),
                "items", events
        ));
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }

    private String buildActorKey(String ip, String fingerprint, String app) {
        return app + "|" + ip + "|" + fingerprint;
    }

    private String getString(Map<String, Object> body, String key, String defaultValue) {
        if (body == null) {
            return defaultValue;
        }

        Object value = body.get(key);
        if (value == null) {
            return defaultValue;
        }

        String text = value.toString().trim();
        return text.isEmpty() ? defaultValue : text;
    }
}

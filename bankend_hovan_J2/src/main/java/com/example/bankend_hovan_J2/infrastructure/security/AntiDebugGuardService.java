package com.example.bankend_hovan_J2.infrastructure.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AntiDebugGuardService {

    private final AntiDebugGuardProperties properties;

    private final Map<String, GuardState> states = new ConcurrentHashMap<>();
    private final ConcurrentLinkedDeque<AuditEvent> auditEvents = new ConcurrentLinkedDeque<>();

    public AntiDebugGuardService(AntiDebugGuardProperties properties) {
        this.properties = properties;
    }

    public GuardResult reportViolation(String actorKey, String app, String route, String event, String ip, String fingerprint) {
        Instant now = Instant.now();
        Duration violationWindow = Duration.ofSeconds(properties.getViolationWindowSeconds());
        Duration lockDuration = Duration.ofSeconds(properties.getLockDurationSeconds());

        GuardState state = states.compute(actorKey, (key, existing) -> {
            GuardState current = existing == null ? GuardState.newState(now) : existing;

            if (current.lockedUntil != null && current.lockedUntil.isAfter(now)) {
                current.lastSeen = now;
                return current;
            }

            if (Duration.between(current.windowStart, now).compareTo(violationWindow) > 0) {
                current.windowStart = now;
                current.violationCount = 0;
            }

            current.violationCount += 1;
            current.lastSeen = now;

            if (current.violationCount >= properties.getViolationThreshold()) {
                current.lockedUntil = now.plus(lockDuration);
                current.violationCount = 0;
                current.windowStart = now;
            }

            return current;
        });

        GuardResult result = toResult(state, now);
        addAuditEvent(new AuditEvent(
            now,
            app,
            route,
            event,
            ip,
            fingerprint,
            result.locked(),
            result.lockRemainingSeconds()
        ));

        return result;
    }

    public GuardResult getStatus(String actorKey) {
        Instant now = Instant.now();
        GuardState state = states.get(actorKey);
        if (state == null) {
            return GuardResult.notLocked();
        }

        if (state.lockedUntil != null && state.lockedUntil.isAfter(now)) {
            return toResult(state, now);
        }

        return GuardResult.notLocked();
    }

    public List<AuditEvent> getRecentEvents(String app, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, properties.getMaxAuditEvents()));
        List<AuditEvent> filtered = new ArrayList<>();

        for (AuditEvent auditEvent : auditEvents) {
            if (app == null || app.isBlank() || app.equalsIgnoreCase(auditEvent.app())) {
                filtered.add(auditEvent);
            }
        }

        filtered.sort(Comparator.comparing(AuditEvent::at).reversed());
        if (filtered.size() > safeLimit) {
            return filtered.subList(0, safeLimit);
        }
        return filtered;
    }

    private GuardResult toResult(GuardState state, Instant now) {
        boolean locked = state.lockedUntil != null && state.lockedUntil.isAfter(now);
        long secondsRemaining = locked ? Duration.between(now, state.lockedUntil).getSeconds() : 0;
        return new GuardResult(locked, Math.max(secondsRemaining, 0));
    }

    private void addAuditEvent(AuditEvent event) {
        auditEvents.addFirst(event);

        while (auditEvents.size() > properties.getMaxAuditEvents()) {
            auditEvents.pollLast();
        }
    }

    private static class GuardState {
        private Instant windowStart;
        private int violationCount;
        private Instant lockedUntil;
        private Instant lastSeen;

        private static GuardState newState(Instant now) {
            GuardState state = new GuardState();
            state.windowStart = now;
            state.violationCount = 0;
            state.lockedUntil = null;
            state.lastSeen = now;
            return state;
        }
    }

    public record GuardResult(boolean locked, long lockRemainingSeconds) {
        static GuardResult notLocked() {
            return new GuardResult(false, 0);
        }
    }

    public record AuditEvent(
            Instant at,
            String app,
            String route,
            String event,
            String ip,
            String fingerprint,
            boolean locked,
            long lockRemainingSeconds
    ) {
    }
}

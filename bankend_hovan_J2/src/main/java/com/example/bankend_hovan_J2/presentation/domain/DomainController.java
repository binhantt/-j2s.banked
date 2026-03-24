package com.example.bankend_hovan_J2.presentation.domain;

import com.example.bankend_hovan_J2.application.domain.CreateDomainRequest;
import com.example.bankend_hovan_J2.application.domain.DomainResponse;
import com.example.bankend_hovan_J2.application.domain.DomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/domains")
@RequiredArgsConstructor
public class DomainController {
    private final DomainService domainService;

    @GetMapping
    public ResponseEntity<List<DomainResponse>> getAllDomains() {
        List<DomainResponse> domains = domainService.getAllDomains();
        return ResponseEntity.ok(domains);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DomainResponse> getDomainById(@PathVariable Long id) {
        DomainResponse domain = domainService.getDomainById(id);
        return ResponseEntity.ok(domain);
    }

    @GetMapping("/status/{isActive}")
    public ResponseEntity<List<DomainResponse>> getDomainsByStatus(@PathVariable Boolean isActive) {
        List<DomainResponse> domains = domainService.getDomainsByStatus(isActive);
        return ResponseEntity.ok(domains);
    }

    @PostMapping
    public ResponseEntity<DomainResponse> createDomain(@Valid @RequestBody CreateDomainRequest request) {
        DomainResponse domain = domainService.createDomain(request);
        return ResponseEntity.ok(domain);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DomainResponse> updateDomain(
            @PathVariable Long id,
            @Valid @RequestBody CreateDomainRequest request) {
        DomainResponse domain = domainService.updateDomain(id, request);
        return ResponseEntity.ok(domain);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DomainResponse> toggleDomainStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        Boolean isActive = request.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().build();
        }
        
        DomainResponse domain = domainService.toggleDomainStatus(id, isActive);
        return ResponseEntity.ok(domain);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDomain(@PathVariable Long id) {
        domainService.deleteDomain(id);
        return ResponseEntity.ok().build();
    }
}
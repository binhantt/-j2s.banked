package com.example.bankend_hovan_J2.presentation.industry;

import com.example.bankend_hovan_J2.application.industry.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/industries")
@RequiredArgsConstructor
public class AdminIndustryController {
    
    private final IndustryService industryService;
    
    @GetMapping
    public ResponseEntity<List<IndustryResponse>> getAllIndustries() {
        List<IndustryResponse> industries = industryService.getAllIndustries()
                .stream()
                .map(IndustryResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(industries);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IndustryResponse> getIndustryById(@PathVariable Long id) {
        IndustryResponse industry = IndustryResponse.from(industryService.getIndustryById(id));
        return ResponseEntity.ok(industry);
    }
    
    @PostMapping
    public ResponseEntity<IndustryResponse> createIndustry(@RequestBody CreateIndustryRequest request) {
        IndustryResponse industry = IndustryResponse.from(industryService.createIndustry(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(industry);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<IndustryResponse> updateIndustry(
            @PathVariable Long id,
            @RequestBody UpdateIndustryRequest request) {
        IndustryResponse industry = IndustryResponse.from(industryService.updateIndustry(id, request));
        return ResponseEntity.ok(industry);
    }
    
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<IndustryResponse> toggleIndustryStatus(@PathVariable Long id) {
        IndustryResponse industry = IndustryResponse.from(industryService.toggleIndustryStatus(id));
        return ResponseEntity.ok(industry);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIndustry(@PathVariable Long id) {
        industryService.deleteIndustry(id);
        return ResponseEntity.noContent().build();
    }
}
package com.example.bankend_hovan_J2.presentation.industry;

import com.example.bankend_hovan_J2.application.industry.IndustryResponse;
import com.example.bankend_hovan_J2.application.industry.IndustryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/industries")
@RequiredArgsConstructor
public class IndustryController {
    
    private final IndustryService industryService;
    
    @GetMapping
    public ResponseEntity<List<IndustryResponse>> getActiveIndustries() {
        List<IndustryResponse> industries = industryService.getActiveIndustries()
                .stream()
                .map(IndustryResponse::from)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(industries);
    }
}
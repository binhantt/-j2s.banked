package com.example.bankend_hovan_J2.presentation.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponse {
    private Double latitude;
    private Double longitude;
    private String address;
    private LocalDateTime updatedAt;
}

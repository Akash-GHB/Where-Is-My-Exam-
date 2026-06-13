package com.whereismyexam.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchInfoDto {
    private Long id;
    private String fileName;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private Integer recordCount;
    private String description;
}

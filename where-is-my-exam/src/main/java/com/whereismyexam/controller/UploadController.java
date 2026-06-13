package com.whereismyexam.controller;

import com.whereismyexam.service.UploadService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping("/upload")
    public String uploadCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedBy", defaultValue = "admin") String uploadedBy,
            @RequestParam(value = "description", defaultValue = "CSV upload") String description) {
        return uploadService.uploadCsv(file, uploadedBy, description);
    }

    @GetMapping("/admin/batches")
    public java.util.List<com.whereismyexam.dto.BatchInfoDto> getBatches() {
        return uploadService.getAllBatches();
    }
}

package com.whereismyexam.controller;

import com.whereismyexam.entity.SearchLog;
import com.whereismyexam.repository.SearchLogRepository;
import com.whereismyexam.repository.UserRepository;
import com.whereismyexam.repository.UploadBatchRepository;
import com.whereismyexam.repository.SeatingGroupRepository;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final UploadBatchRepository uploadBatchRepository;
    private final SearchLogRepository searchLogRepository;
    private final SeatingGroupRepository seatingGroupRepository;

    public AdminController(UserRepository userRepository, UploadBatchRepository uploadBatchRepository,
            SearchLogRepository searchLogRepository, SeatingGroupRepository seatingGroupRepository) {
        this.userRepository = userRepository;
        this.uploadBatchRepository = uploadBatchRepository;
        this.searchLogRepository = searchLogRepository;
        this.seatingGroupRepository = seatingGroupRepository;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of(
                "totalUsers", userRepository.count(),
                "totalRecords", seatingGroupRepository.sumStrength(),
                "totalBatches", uploadBatchRepository.count(),
                "totalSearches", searchLogRepository.count());
    }

    @GetMapping("/search-logs")
    public Page<SearchLog> getSearchLogs(@RequestParam(name = "page", defaultValue = "0") int page,
                                         @RequestParam(name = "size", defaultValue = "50") int size) {
        return searchLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
    }

    @GetMapping("/export/search-logs")
    public ResponseEntity<byte[]> exportSearchLogs() {
        List<SearchLog> logs = searchLogRepository.findAll();
        StringBuilder csv = new StringBuilder("ID,Register Number,Timestamp\n");
        for (SearchLog log : logs) {
            csv.append(log.getId()).append(",")
               .append(log.getRegNo() != null ? log.getRegNo() : "").append(",")
               .append(log.getTimestamp()).append("\n");
        }
        
        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"search-logs.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    @DeleteMapping("/delete-batch/{id}")
    public Map<String, String> deleteBatch(@PathVariable Long id) {
        uploadBatchRepository.deleteById(id);
        return Map.of("message", "Batch deleted successfully");
    }
}

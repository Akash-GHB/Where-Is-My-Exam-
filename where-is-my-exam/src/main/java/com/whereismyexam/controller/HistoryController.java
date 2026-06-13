package com.whereismyexam.controller;

import com.whereismyexam.dto.HistoryRequest;
import com.whereismyexam.entity.DownloadHistory;
import com.whereismyexam.entity.User;
import com.whereismyexam.repository.DownloadHistoryRepository;
import com.whereismyexam.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final DownloadHistoryRepository downloadHistoryRepository;
    private final UserRepository userRepository;

    public HistoryController(DownloadHistoryRepository downloadHistoryRepository, UserRepository userRepository) {
        this.downloadHistoryRepository = downloadHistoryRepository;
        this.userRepository = userRepository;
    }

    // Resolve user by username OR email (handles both login styles)
    private User resolveUser(String principal) {
        return userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + principal));
    }

    // POST /api/history -> Save new download
    @PostMapping
    public ResponseEntity<?> saveHistory(@RequestBody HistoryRequest request, Authentication authentication) {
        User user = resolveUser(authentication.getName());

        DownloadHistory history = new DownloadHistory();
        history.setUser(user);
        history.setRegNo(request.getRegNo());
        history.setExamDate(request.getExamDate());
        history.setSession(request.getSession());
        history.setDownloadedAt(LocalDateTime.now());

        downloadHistoryRepository.save(history);
        return ResponseEntity.ok(Map.of("message", "History recorded successfully"));
    }

    // GET /api/history -> Fetch user's history
    @GetMapping
    public List<DownloadHistory> getHistory(Authentication authentication) {
        User user = resolveUser(authentication.getName());
        return downloadHistoryRepository.findByUserOrderByDownloadedAtDesc(user);
    }
}

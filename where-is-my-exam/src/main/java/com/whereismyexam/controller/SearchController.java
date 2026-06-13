package com.whereismyexam.controller;

import com.whereismyexam.entity.SeatingGroup;
import com.whereismyexam.entity.SearchLog;
import com.whereismyexam.entity.User;
import com.whereismyexam.repository.SearchLogRepository;
import com.whereismyexam.repository.UserRepository;
import com.whereismyexam.service.EmailService;
import com.whereismyexam.service.SearchService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class SearchController {
    private final SearchService searchService;
    private final SearchLogRepository searchLogRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public SearchController(SearchService searchService,
            SearchLogRepository searchLogRepository,
            EmailService emailService,
            UserRepository userRepository) {
        this.searchService = searchService;
        this.searchLogRepository = searchLogRepository;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam("reg_no") String reg_no,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam("session") String session) {

        // Log the search
        SearchLog log = new SearchLog();
        log.setRegNo(reg_no);
        log.setSearchDate(date);
        log.setTimestamp(LocalDateTime.now());
        searchLogRepository.save(log);

        Optional<SeatingGroup> result = searchService.findByRegister(reg_no, date, session);

        if (result.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "No record found"));
        }

        SeatingGroup g = result.get();
        Map<String, Object> map = new HashMap<>();
        map.put("reg_no", reg_no);
        map.put("program", g.getProgram());
        map.put("branch", g.getBranch());
        map.put("course_name", g.getCourseName());
        map.put("room_no", g.getRoomNo());
        map.put("block", g.getBlock());
        map.put("floor", g.getFloor());
        map.put("latitude", g.getLatitude());
        map.put("longitude", g.getLongitude());

        // Send hall ticket email if user is authenticated — wrapped so email failure
        // never causes 500
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                Optional<User> userOpt = userRepository.findByUsername(username)
                        .or(() -> userRepository.findByEmail(username));

                userOpt.ifPresent(user -> {
                    if (user.getEmail() != null && !user.getEmail().isBlank()) {
                        emailService.sendHallTicketEmail(
                                user.getEmail(),
                                user.getName() != null ? user.getName() : username,
                                reg_no,
                                g.getCourseName() != null ? g.getCourseName() : "N/A",
                                date.toString(),
                                session,
                                g.getRoomNo() != null ? g.getRoomNo() : "N/A",
                                g.getBlock() != null ? g.getBlock() : "N/A",
                                g.getFloor() != null ? g.getFloor() : "N/A");
                    }
                });
            }
        } catch (Exception e) {
            System.err.println("Email send failed (non-critical): " + e.getMessage());
        }

        return ResponseEntity.ok(map);
    }
}

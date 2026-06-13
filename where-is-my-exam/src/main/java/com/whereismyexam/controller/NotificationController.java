package com.whereismyexam.controller;

import com.whereismyexam.entity.Notification;
import com.whereismyexam.entity.User;
import com.whereismyexam.repository.UserRepository;
import com.whereismyexam.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User resolveUser(String principal) {
        return userRepository.findByUsername(principal)
                .or(() -> userRepository.findByEmail(principal))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + principal));
    }

    @GetMapping
    public List<Notification> getNotifications(Authentication authentication) {
        User user = resolveUser(authentication.getName());
        return notificationService.getNotifications(user);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        User user = resolveUser(authentication.getName());
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        User user = resolveUser(authentication.getName());
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }
}

package com.whereismyexam.service;

import com.whereismyexam.entity.User;
import com.whereismyexam.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Simple in-memory rate limiter: email → last OTP request time
    private final Map<String, LocalDateTime> rateLimitMap = new ConcurrentHashMap<>();
    private static final int RATE_LIMIT_SECONDS = 60;
    private static final int OTP_EXPIRY_MINUTES = 5;

    public PasswordResetService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Generate and send a 6-digit OTP to the user's email.
     */
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        // Rate limiting — 1 OTP per 60 seconds per email
        LocalDateTime lastRequest = rateLimitMap.get(email.toLowerCase());
        if (lastRequest != null && lastRequest.plusSeconds(RATE_LIMIT_SECONDS).isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Please wait before requesting another OTP.");
        }

        // Generate 6-digit OTP
        String otp = generateOtp();

        // Store OTP and expiry on user
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);

        // Update rate limit
        rateLimitMap.put(email.toLowerCase(), LocalDateTime.now());

        // Send OTP email
        emailService.sendOtpEmail(user.getEmail(), user.getName() != null ? user.getName() : "User", otp);
    }

    /**
     * Verify the OTP for the given email.
     */
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new RuntimeException("No OTP was requested for this account.");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            // Clear expired OTP
            user.setOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        if (!user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP. Please check and try again.");
        }

        // OTP is valid — don't clear it yet, clear it after password reset
    }

    /**
     * Reset the password for the given email after OTP has been verified.
     */
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear OTP fields
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // 6-digit range
        return String.valueOf(otp);
    }
}

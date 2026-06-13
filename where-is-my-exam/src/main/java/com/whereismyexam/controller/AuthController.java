package com.whereismyexam.controller;

import com.whereismyexam.dto.AuthRequest;
import com.whereismyexam.dto.AuthResponse;
import com.whereismyexam.dto.ForgotPasswordRequest;
import com.whereismyexam.dto.VerifyOtpRequest;
import com.whereismyexam.dto.ResetPasswordRequest;
import com.whereismyexam.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private com.whereismyexam.service.AuthService authService;

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest authRequest) {
        return authService.login(authRequest);
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody com.whereismyexam.dto.RegisterRequest registerRequest) {
        return authService.register(registerRequest);
    }

    @PostMapping("/google")
    public AuthResponse googleLogin(@RequestBody com.whereismyexam.dto.GoogleAuthRequest request) {
        return authService.loginWithGoogle(request);
    }

    // ─── Forgot Password Flow ────────────────────────────────────────────

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.sendOtp(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email address."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        try {
            passwordResetService.verifyOtp(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getEmail(), request.getNewPassword());
            return ResponseEntity
                    .ok(Map.of("message", "Password reset successfully. You can now login with your new password."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

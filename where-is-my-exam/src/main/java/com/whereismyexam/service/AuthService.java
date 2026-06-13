package com.whereismyexam.service;

import com.whereismyexam.dto.AuthRequest;
import com.whereismyexam.dto.AuthResponse;
import com.whereismyexam.dto.RegisterRequest;
import com.whereismyexam.entity.User;
import com.whereismyexam.repository.UserRepository;
import com.whereismyexam.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + request.getUsername() + "' already exists.");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("An account with email '" + request.getEmail() + "' already exists.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole("ROLE_USER"); // All registrations are regular users

        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername(), user.getName(), user.getRole());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        if (authentication.isAuthenticated()) {
            User user = userRepository.findByUsername(request.getUsername())
                    .or(() -> userRepository.findByEmail(request.getUsername()))
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getUsername()));

            String token = jwtService.generateToken(user.getUsername(), user.getName(), user.getRole());
            return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
        } else {
            throw new UsernameNotFoundException("invalid user request!");
        }
    }

    @org.springframework.beans.factory.annotation.Value("${google.client.id}")
    private String googleClientId;

    public AuthResponse loginWithGoogle(com.whereismyexam.dto.GoogleAuthRequest request) {
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory())
                    .setAudience(java.util.Collections.singletonList(googleClientId))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken != null) {
                com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Find or create user
                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(email.split("@")[0] + "_" + System.currentTimeMillis());
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : "Google User");
                    newUser.setRole("ROLE_USER");
                    newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                    return userRepository.save(newUser);
                });

                String token = jwtService.generateToken(user.getUsername(), user.getName(), user.getRole());
                return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
            } else {
                throw new RuntimeException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }
}

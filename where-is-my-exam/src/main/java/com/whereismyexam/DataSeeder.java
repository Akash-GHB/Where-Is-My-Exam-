package com.whereismyexam;

import com.whereismyexam.entity.User;
import com.whereismyexam.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Force specific user to ROLE_USER for test verification
        userRepository.findAll().stream()
                .filter(u -> "akash2005akash@gmail.com".equalsIgnoreCase(u.getEmail()))
                .findFirst()
                .ifPresent(user -> {
                    user.setRole("ROLE_USER");
                    userRepository.save(user);
                    System.out.println("Forced ROLE_USER for verification account: " + user.getEmail());
                });

        // Migrate legacy roles
        userRepository.findAll().forEach(user -> {
            boolean updated = false;
            if ("USER".equals(user.getRole())) {
                user.setRole("ROLE_USER");
                updated = true;
            } else if ("ADMIN".equals(user.getRole())) {
                user.setRole("ROLE_ADMIN");
                updated = true;
            }

            if (updated) {
                userRepository.save(user);
                System.out.println("Migrated role for user: " + user.getUsername());
            }
        });

        // Ensure default admin exists
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Admin User");
            admin.setEmail("admin@whereismyexam.com");
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);
            System.out.println("Seeded default admin user");
        }
    }
}

package com.whereismyexam.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String name;

    @Column(unique = true)
    private String email;

    private String role;

    private String avatarUrl;

    private String otp;

    private java.time.LocalDateTime otpExpiry;
}

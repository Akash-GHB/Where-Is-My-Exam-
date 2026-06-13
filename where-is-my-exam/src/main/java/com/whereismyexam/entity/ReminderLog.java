package com.whereismyexam.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Tracks which reminder emails have already been sent.
 * Prevents duplicate reminders for the same student + exam date.
 */
@Entity
@Table(name = "reminder_log", uniqueConstraints = @UniqueConstraint(columnNames = { "user_email", "exam_date" }))
public class ReminderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    public ReminderLog() {
    }

    public ReminderLog(String userEmail, LocalDate examDate) {
        this.userEmail = userEmail;
        this.examDate = examDate;
        this.sentAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}

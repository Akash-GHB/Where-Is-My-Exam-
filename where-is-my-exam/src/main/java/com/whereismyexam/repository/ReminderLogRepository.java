package com.whereismyexam.repository;

import com.whereismyexam.entity.ReminderLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ReminderLogRepository extends JpaRepository<ReminderLog, Long> {

    /**
     * Returns true if a reminder was already sent to this email for this exam date.
     */
    boolean existsByUserEmailAndExamDate(String userEmail, LocalDate examDate);
}

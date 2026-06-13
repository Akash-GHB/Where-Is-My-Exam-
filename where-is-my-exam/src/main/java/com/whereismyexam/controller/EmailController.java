package com.whereismyexam.controller;

import com.whereismyexam.service.ExamReminderScheduler;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EmailController {

    private final ExamReminderScheduler reminderScheduler;

    public EmailController(ExamReminderScheduler reminderScheduler) {
        this.reminderScheduler = reminderScheduler;
    }

    /**
     * Admin-only: manually trigger reminder emails for a specific date.
     * If no date is provided, defaults to tomorrow.
     *
     * POST /api/admin/email/send-reminders
     * POST /api/admin/email/send-reminders?date=2026-04-12
     */
    @PostMapping("/admin/email/send-reminders")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> sendReminders(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate targetDate = (date != null) ? date : LocalDate.now().plusDays(1);
        int count = reminderScheduler.sendRemindersForDate(targetDate);

        return Map.of(
                "success", true,
                "date", targetDate.toString(),
                "emailsSent", count,
                "message", count > 0
                        ? count + " reminder emails sent for " + targetDate
                        : "No matching students found for " + targetDate);
    }
}

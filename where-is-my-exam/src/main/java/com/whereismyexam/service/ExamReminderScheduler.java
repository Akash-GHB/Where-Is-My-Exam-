package com.whereismyexam.service;

import com.whereismyexam.entity.ReminderLog;
import com.whereismyexam.entity.SeatingGroup;
import com.whereismyexam.entity.User;
import com.whereismyexam.repository.ReminderLogRepository;
import com.whereismyexam.repository.SeatingGroupRepository;
import com.whereismyexam.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Runs daily and sends reminder emails to students
 * whose exam is the next day. Each student receives
 * at most ONE reminder per exam date.
 */
@Component
public class ExamReminderScheduler {

    private final SeatingGroupRepository seatingRepo;
    private final UserRepository userRepo;
    private final ReminderLogRepository reminderLogRepo;
    private final EmailService emailService;

    public ExamReminderScheduler(SeatingGroupRepository seatingRepo,
            UserRepository userRepo,
            ReminderLogRepository reminderLogRepo,
            EmailService emailService) {
        this.seatingRepo = seatingRepo;
        this.userRepo = userRepo;
        this.reminderLogRepo = reminderLogRepo;
        this.emailService = emailService;
    }

    /**
     * Runs every day at 8:00 PM IST.
     */
    @Scheduled(cron = "0 0 20 * * *", zone = "Asia/Kolkata")
    public void sendDailyReminders() {
        System.out.println("🔔 ExamReminderScheduler: Starting daily reminder check...");
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        sendRemindersForDate(tomorrow);
    }

    /**
     * Public method so admin can also trigger reminders manually.
     * Returns the count of emails actually sent (skips duplicates).
     */
    public int sendRemindersForDate(LocalDate examDate) {
        List<SeatingGroup> examsOnDate = seatingRepo.findByExamDate(examDate);

        if (examsOnDate.isEmpty()) {
            System.out.println("📭 No exams found for " + examDate);
            return 0;
        }

        System.out.println("📋 Found " + examsOnDate.size() + " exam groups for " + examDate);

        List<User> allUsers = userRepo.findAll();
        int emailsSent = 0;
        int skipped = 0;

        for (SeatingGroup group : examsOnDate) {
            String regFromStr = group.getRegFrom();
            String regToStr = group.getRegTo();
            if (regFromStr == null || regToStr == null)
                continue;

            String fromDigits = regFromStr.replaceAll("\\D", "");
            String toDigits = regToStr.replaceAll("\\D", "");
            if (fromDigits.isEmpty() || toDigits.isEmpty())
                continue;

            long regFrom, regTo;
            try {
                regFrom = Long.parseLong(fromDigits);
                regTo = Long.parseLong(toDigits);
            } catch (NumberFormatException e) {
                continue;
            }

            for (User user : allUsers) {
                if ("ROLE_ADMIN".equals(user.getRole()))
                    continue;
                if (user.getEmail() == null || user.getEmail().isBlank())
                    continue;

                String userDigits = user.getUsername() == null ? ""
                        : user.getUsername().replaceAll("\\D", "");
                if (userDigits.isEmpty())
                    continue;

                try {
                    long userReg = Long.parseLong(userDigits);
                    if (userReg < regFrom || userReg > regTo)
                        continue;

                    // ── Deduplication check ─────────────────────────────
                    if (reminderLogRepo.existsByUserEmailAndExamDate(user.getEmail(), examDate)) {
                        System.out.println("⏭️  Skipping " + user.getEmail() + " (already sent for " + examDate + ")");
                        skipped++;
                        continue;
                    }

                    // ── Send email ──────────────────────────────────────
                    emailService.sendExamReminderEmail(
                            user.getEmail(),
                            user.getName() != null ? user.getName() : user.getUsername(),
                            group.getCourseName() != null ? group.getCourseName() : "N/A",
                            examDate.toString(),
                            group.getSession() != null ? group.getSession() : "N/A",
                            group.getRoomNo() != null ? group.getRoomNo() : "N/A",
                            group.getBlock() != null ? group.getBlock() : "N/A",
                            group.getFloor() != null ? group.getFloor() : "N/A");

                    // ── Log the sent reminder ───────────────────────────
                    reminderLogRepo.save(new ReminderLog(user.getEmail(), examDate));
                    emailsSent++;

                } catch (NumberFormatException ignored) {
                    // username not a reg number
                }
            }
        }

        System.out
                .println("✅ Sent " + emailsSent + " reminder(s), skipped " + skipped + " duplicate(s) for " + examDate);
        return emailsSent;
    }
}

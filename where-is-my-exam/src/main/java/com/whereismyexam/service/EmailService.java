package com.whereismyexam.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

  private final JavaMailSender mailSender;
  private static final String FROM = "WhereIsMyExam <whereismyexam@gmail.com>";

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  // ─── Hall Ticket Email (sent after search) ──────────────────────────
  public void sendHallTicketEmail(String toEmail, String studentName,
      String regNo, String courseName,
      String examDate, String session,
      String roomNo, String block, String floor) {
    String subject = "🎓 Exam Hall Ticket — " + regNo;

    String html = """
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#111;color:#fff;padding:24px 32px;">
            <h1 style="margin:0;font-size:22px;">📋 Where Is My Exam</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#aaa;">Your Exam Hall Ticket</p>
          </div>
          <div style="padding:24px 32px;">
            <p style="font-size:15px;color:#333;">Hello <strong>%s</strong>,</p>
            <p style="font-size:14px;color:#555;">Your exam details have been confirmed. Here is your hall ticket information:</p>
            <table style="width:100%%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:600;color:#333;width:40%%;">Register Number</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:600;color:#333;">Course</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:600;color:#333;">Exam Date</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:600;color:#333;">Session</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:600;color:#333;">Room Number</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;font-size:18px;font-weight:700;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:600;color:#333;">Block</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#f9f9f9;font-weight:600;color:#333;">Floor</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
            </table>
            <p style="font-size:13px;color:#888;">You can also download your admit card from the portal.</p>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
            Best of luck for your exams! 🍀<br/>
            &copy; WhereIsMyExam
          </div>
        </div>
        """
        .formatted(studentName, regNo, courseName, examDate, session, roomNo, block, floor);

    sendHtmlEmail(toEmail, subject, html);
  }

  // ─── Exam Reminder Email (sent day before) ──────────────────────────
  public void sendExamReminderEmail(String toEmail, String studentName,
      String courseName, String examDate,
      String session, String roomNo,
      String block, String floor) {
    String subject = "⏰ Exam Reminder — Tomorrow!";

    String html = """
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#b45309;color:#fff;padding:24px 32px;">
            <h1 style="margin:0;font-size:22px;">⏰ Exam Reminder</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#fed;">Your exam is tomorrow!</p>
          </div>
          <div style="padding:24px 32px;">
            <p style="font-size:15px;color:#333;">Hello <strong>%s</strong>,</p>
            <p style="font-size:14px;color:#555;">This is a friendly reminder that you have an exam <strong>tomorrow</strong>. Please review your details below:</p>
            <table style="width:100%%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#fff7ed;font-weight:600;color:#333;width:40%%;">Course</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#fff7ed;font-weight:600;color:#333;">Exam Date</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#fff7ed;font-weight:600;color:#333;">Session</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#fff7ed;font-weight:600;color:#333;">Room</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;font-size:18px;font-weight:700;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#fff7ed;font-weight:600;color:#333;">Block</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
              <tr><td style="padding:10px 12px;border:1px solid #eee;background:#fff7ed;font-weight:600;color:#333;">Floor</td>
                  <td style="padding:10px 12px;border:1px solid #eee;color:#111;">%s</td></tr>
            </table>
            <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:12px 16px;margin:16px 0;">
              <p style="margin:0;font-size:13px;color:#92400e;">💡 <strong>Tips:</strong> Carry your ID card, reach 30 minutes early, and bring required stationery.</p>
            </div>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
            Best of luck! 🍀<br/>
            &copy; WhereIsMyExam
          </div>
        </div>
        """
        .formatted(studentName, courseName, examDate, session, roomNo, block, floor);

    sendHtmlEmail(toEmail, subject, html);
  }

  // ─── OTP Email (for password reset) ────────────────────────────────
  public void sendOtpEmail(String toEmail, String userName, String otp) {
    String subject = "🔐 Password Reset OTP — Where Is My Exam";

    String html = """
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
          <div style="background:#111;color:#fff;padding:24px 32px;">
            <h1 style="margin:0;font-size:22px;">🔐 Password Reset</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#aaa;">Where Is My Exam</p>
          </div>
          <div style="padding:24px 32px;">
            <p style="font-size:15px;color:#333;">Hello <strong>%s</strong>,</p>
            <p style="font-size:14px;color:#555;">We received a request to reset your password. Use the OTP below to proceed:</p>
            <div style="text-align:center;margin:30px 0;">
              <div style="display:inline-block;background:#f5f5f5;border:2px solid #e0e0e0;border-radius:12px;padding:20px 40px;letter-spacing:12px;font-size:36px;font-weight:bold;color:#111;">
                %s
              </div>
            </div>
            <p style="font-size:13px;color:#888;text-align:center;">This OTP is valid for <strong>5 minutes</strong>.</p>
            <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#856404;">⚠️ If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            </div>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
            &copy; WhereIsMyExam — Secure Password Reset
          </div>
        </div>
        """
        .formatted(userName, otp);

    sendHtmlEmail(toEmail, subject, html);
  }

  // ─── Common HTML sender ─────────────────────────────────────────────
  private void sendHtmlEmail(String to, String subject, String htmlBody) {
    try {
      MimeMessage mimeMessage = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
      helper.setFrom(FROM);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(htmlBody, true); // true = HTML
      mailSender.send(mimeMessage);
      System.out.println("✅ Email sent to " + to + " — " + subject);
    } catch (MessagingException e) {
      System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
    }
  }
}

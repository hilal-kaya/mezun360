package tr.edu.btu.mezun360.notification.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import tr.edu.btu.mezun360.outbox.application.OutboxEventHandler;
import tr.edu.btu.mezun360.outbox.domain.OutboxEvent;

import java.util.List;
import java.util.Map;

@Service
@Primary
public class EmailNotificationService implements OutboxEventHandler {
    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    public EmailNotificationService(JavaMailSender mailSender, TemplateEngine templateEngine, ObjectMapper objectMapper, JdbcTemplate jdbcTemplate) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.objectMapper = objectMapper;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void handle(OutboxEvent event) {
        try {
            JsonNode payload = objectMapper.readTree(event.getPayload());

            if ("MENTORSHIP_REQUEST_RECEIVED".equals(event.getType())) {
                handleMentorshipRequest(payload);
            } else if ("MENTORSHIP_ACCEPTED".equals(event.getType())) {
                handleMentorshipAccepted(payload);
            } else if ("NEW_JOB_POST".equals(event.getType())) {
                handleNewJobPost(payload);
            } else {
                log.warn("Unknown event type for email notification: {}", event.getType());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email for event " + event.getId(), e);
        }
    }

    private void handleMentorshipRequest(JsonNode payload) throws Exception {
        String mentorId = payload.get("mentorId").asText();
        String menteeId = payload.get("menteeId").asText();
        String message = payload.get("message").asText();

        Map<String, Object> mentorInfo = getUserInfo(mentorId);
        Map<String, Object> menteeInfo = getUserInfo(menteeId);

        if (mentorInfo == null || menteeInfo == null) return;

        Context context = new Context();
        context.setVariable("mentorName", mentorInfo.get("first_name"));
        context.setVariable("menteeName", menteeInfo.get("first_name") + " " + menteeInfo.get("last_name"));
        context.setVariable("message", message);
        context.setVariable("actionUrl", "https://mezun360.btu.edu.tr/app/mentorship");
        context.setVariable("unsubscribeUrl", "https://mezun360.btu.edu.tr/app/preferences");

        String html = templateEngine.process("mentorship-request", context);
        sendHtmlEmail((String) mentorInfo.get("email"), "Yeni Mentörlük Talebi", html);
    }

    private void handleMentorshipAccepted(JsonNode payload) throws Exception {
        String mentorId = payload.get("mentorId").asText();
        String menteeId = payload.get("menteeId").asText();

        Map<String, Object> mentorInfo = getUserInfo(mentorId);
        Map<String, Object> menteeInfo = getUserInfo(menteeId);

        if (mentorInfo == null || menteeInfo == null) return;

        Context context = new Context();
        context.setVariable("mentorName", mentorInfo.get("first_name") + " " + mentorInfo.get("last_name"));
        context.setVariable("menteeName", menteeInfo.get("first_name"));
        context.setVariable("actionUrl", "https://mezun360.btu.edu.tr/app/mentorship");
        context.setVariable("unsubscribeUrl", "https://mezun360.btu.edu.tr/app/preferences");

        String html = templateEngine.process("mentorship-accepted", context);
        sendHtmlEmail((String) menteeInfo.get("email"), "Mentörlük Talebiniz Onaylandı", html);
    }

    private void handleNewJobPost(JsonNode payload) throws Exception {
        String title = payload.get("title").asText();
        String company = payload.get("company").asText();

        // Query all verified alumni with directory_opt_in = true (or just all verified alumni who opted in for emails)
        // For simplicity, let's send to all users who have an ALUMNI role. In a real app, this would be chunked or a mailing list.
        // We will just fetch up to 100 verified alumni for this milestone to avoid huge memory spikes.
        List<Map<String, Object>> recipients = jdbcTemplate.queryForList(
                "SELECT u.email, p.first_name FROM mezun360.user_accounts u " +
                "JOIN mezun360.alumni_profiles p ON p.user_id = u.id " +
                "JOIN mezun360.alumni_verification_requests r ON r.profile_id = p.id " +
                "WHERE r.status = 'VERIFIED' AND u.status = 'ACTIVE' LIMIT 100"
        );

        for (Map<String, Object> recipient : recipients) {
            Context context = new Context();
            context.setVariable("recipientName", recipient.get("first_name"));
            context.setVariable("jobTitle", title);
            context.setVariable("companyName", company);
            context.setVariable("actionUrl", "https://mezun360.btu.edu.tr/app/jobs");
            context.setVariable("unsubscribeUrl", "https://mezun360.btu.edu.tr/app/preferences");

            String html = templateEngine.process("new-job-post", context);
            sendHtmlEmail((String) recipient.get("email"), "Yeni Bir İş İlanı Yayınlandı", html);
        }
    }

    private Map<String, Object> getUserInfo(String userId) {
        try {
            return jdbcTemplate.queryForMap(
                "SELECT u.email, p.first_name, p.last_name FROM mezun360.user_accounts u " +
                "JOIN mezun360.alumni_profiles p ON p.user_id = u.id WHERE u.id = ?::uuid",
                userId
            );
        } catch (Exception e) {
            log.warn("Could not find user info for {}", userId);
            return null;
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom("noreply@mezun360.btu.edu.tr");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
        log.info("Sent email to {} with subject: {}", to, subject);
    }
}

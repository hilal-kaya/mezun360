package tr.edu.btu.mezun360.notification;

import com.icegreen.greenmail.configuration.GreenMailConfiguration;
import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tr.edu.btu.mezun360.outbox.application.OutboxEventProcessor;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

@SpringBootTest(properties = {
        "spring.profiles.active=local",
        "mezun360.outbox.fixed-delay=1000"
})
@Testcontainers
class EmailNotificationIntegrationTest {

    @Container
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.9-alpine");

    @RegisterExtension
    static GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP)
            .withConfiguration(GreenMailConfiguration.aConfig().withUser("test", "test"))
            .withPerMethodLifecycle(false);

    @DynamicPropertySource
    static void dynamicProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.mail.host", () -> greenMail.getSmtp().getBindTo());
        registry.add("spring.mail.port", () -> greenMail.getSmtp().getPort());
        registry.add("spring.mail.username", () -> "test");
        registry.add("spring.mail.password", () -> "test");
    }

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    OutboxEventProcessor processor;

    @Test
    void shouldProcessMentorshipRequestEventAndSendEmail() throws Exception {
        UUID mentorId = UUID.randomUUID();
        UUID menteeId = UUID.randomUUID();
        
        jdbcTemplate.update("INSERT INTO mezun360.user_accounts (id, email, email_canonical, password_hash, role, status, email_verified_at, created_at, updated_at) VALUES (?, 'mentor@example.com', 'mentor@example.com', '{argon2id}$argon2id$mockhash', 'ALUMNI', 'ACTIVE', now(), now(), now())", mentorId);
        jdbcTemplate.update("INSERT INTO mezun360.user_accounts (id, email, email_canonical, password_hash, role, status, email_verified_at, created_at, updated_at) VALUES (?, 'mentee@example.com', 'mentee@example.com', '{argon2id}$argon2id$mockhash', 'ALUMNI', 'ACTIVE', now(), now(), now())", menteeId);
        
        jdbcTemplate.update("INSERT INTO mezun360.alumni_profiles (id, user_id, first_name, last_name, created_at, updated_at) VALUES (?, ?, 'MentorFirst', 'MentorLast', now(), now())", UUID.randomUUID(), mentorId);
        jdbcTemplate.update("INSERT INTO mezun360.alumni_profiles (id, user_id, first_name, last_name, created_at, updated_at) VALUES (?, ?, 'MenteeFirst', 'MenteeLast', now(), now())", UUID.randomUUID(), menteeId);
        
        String payload = String.format("""
            {
                "mentorId": "%s",
                "menteeId": "%s",
                "message": "Hello I want you to be my mentor"
            }
        """, mentorId, menteeId);
        
        UUID eventId = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO mezun360.outbox_events (id, type, aggregate_id, occurred_at, correlation_id, payload, status, retry_count, created_at, updated_at, version) " +
            "VALUES (?, 'MENTORSHIP_REQUEST_RECEIVED', ?, now(), ?, ?::jsonb, 'PENDING', 0, now(), now(), 0)",
            eventId, UUID.randomUUID(), UUID.randomUUID(), payload
        );

        processor.processPendingEvents();

        await().untilAsserted(() -> {
            MimeMessage[] messages = greenMail.getReceivedMessages();
            assertThat(messages).isNotEmpty();
            MimeMessage msg = messages[0];
            assertThat(msg.getSubject()).isEqualTo("Yeni Mentörlük Talebi");
            assertThat(msg.getAllRecipients()[0].toString()).isEqualTo("mentor@example.com");
            
            String content = com.icegreen.greenmail.util.GreenMailUtil.getBody(msg);
            assertThat(content).contains("MentorFirst");
            assertThat(content).contains("MenteeFirst MenteeLast");
            assertThat(content).contains("Hello I want you to be my mentor");
        });
        
        String status = jdbcTemplate.queryForObject("SELECT status FROM mezun360.outbox_events WHERE id = ?", String.class, eventId);
        assertThat(status).isEqualTo("PROCESSED");
    }
}

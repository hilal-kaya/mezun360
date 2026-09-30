package tr.edu.btu.mezun360.mentorship;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.CookiePolicy;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import tr.edu.btu.mezun360.identity.application.DevelopmentAccountService;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.outbox.domain.OutboxEvent;
import tr.edu.btu.mezun360.outbox.infrastructure.OutboxEventRepository;

import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.profiles.active=local",
    "mezun360.security.dev-users-enabled=true"
})
@Testcontainers
@ActiveProfiles("test")
public class MentorshipIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("mezun360")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @LocalServerPort
    int port;

    @Autowired
    DevelopmentAccountService accountService;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Autowired
    OutboxEventRepository outboxEventRepository;

    @Autowired ObjectMapper mapper;
    
    CookieManager cookies;
    HttpClient client;

    @BeforeEach
    void setup() {
        cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        client = HttpClient.newBuilder().cookieHandler(cookies).build();
    }

    HttpResponse<String> send(String method, String path, String body, String csrf) throws Exception {
        var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (csrf != null) request.header("X-CSRF-TOKEN", csrf);
        if (body != null) request.header("Content-Type", "application/json");
        request.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    String csrf() throws Exception {
        return mapper.readTree(send("GET", "/api/v1/auth/csrf", null, null).body()).path("token").asText();
    }

    HttpResponse<String> login(String user, String password) throws Exception {
        return send("POST", "/api/v1/auth/login", mapper.writeValueAsString(Map.of("email", user, "password", password)), csrf());
    }

    private void makeVerified(UUID userId, boolean optedIn, UUID adminId) {
        UUID profileId = UUID.randomUUID();
        jdbcTemplate.update("INSERT INTO mezun360.alumni_profiles (id, user_id, first_name, last_name, created_at, updated_at, version) VALUES (?, ?, 'Test', 'Name', NOW(), NOW(), 0)", profileId, userId);
        jdbcTemplate.update("INSERT INTO mezun360.alumni_privacy_settings (profile_id, directory_opt_in, created_at, updated_at, version) VALUES (?, ?, NOW(), NOW(), 0)", profileId, optedIn);
        jdbcTemplate.update("INSERT INTO mezun360.alumni_verification_requests (id, profile_id, evidence_revision, evidence, status, source, submitted_at, reviewed_at, reviewed_by, updated_at, created_at, version) VALUES (?, ?, 0, '{}', 'VERIFIED', 'MANUAL_ADMIN', NOW(), NOW(), ?, NOW(), NOW(), 0)", UUID.randomUUID(), profileId, adminId);
    }

    @Test
    void mentorshipFlowAndSecurityTest() throws Exception {
        // Setup Users
        UUID adminId = accountService.create("admin@example.com", "TestPassword-123!", Role.ADMIN);
        UUID mentorId = accountService.create("mentor@example.com", "TestPassword-123!", Role.ALUMNI);
        UUID menteeId = accountService.create("mentee@example.com", "TestPassword-123!", Role.ALUMNI);
        UUID unverifiedId = accountService.create("unverified@example.com", "TestPassword-123!", Role.ALUMNI);

        makeVerified(mentorId, true, adminId);
        makeVerified(menteeId, true, adminId);

        // Login as unverified
        assertThat(login("unverified@example.com", "TestPassword-123!").statusCode()).isEqualTo(200);

        // Try to create request (should fail)
        var resUnverified = send("POST", "/api/v1/mentorship/requests", "{\"mentorId\":\"" + mentorId + "\",\"message\":\"I want to learn Java.\"}", csrf());
        assertThat(resUnverified.statusCode()).isEqualTo(403);

        // Login as mentee
        cookies.getCookieStore().removeAll();
        assertThat(login("mentee@example.com", "TestPassword-123!").statusCode()).isEqualTo(200);

        // Create request
        var resCreate = send("POST", "/api/v1/mentorship/requests", "{\"mentorId\":\"" + mentorId + "\",\"message\":\"I want to learn Java and Spring.\"}", csrf());
        assertThat(resCreate.statusCode()).isEqualTo(201);
        
        // Extract Request ID
        String body = resCreate.body();
        String requestIdStr = body.substring(body.indexOf("\"id\":\"") + 6, body.indexOf("\"", body.indexOf("\"id\":\"") + 6));
        UUID requestId = UUID.fromString(requestIdStr);

        // Check OutboxEvent
        List<OutboxEvent> events = outboxEventRepository.findAll();
        assertThat(events).anyMatch(e -> e.getType().equals("MENTORSHIP_REQUEST_RECEIVED"));

        // Login as mentor
        cookies.getCookieStore().removeAll();
        assertThat(login("mentor@example.com", "TestPassword-123!").statusCode()).isEqualTo(200);

        // Accept request
        var resAccept = send("PATCH", "/api/v1/mentorship/requests/" + requestId + "/status", "{\"status\":\"ACCEPTED\"}", csrf());
        assertThat(resAccept.statusCode()).isEqualTo(200);

        // Check OutboxEvent for ACCEPTED
        List<OutboxEvent> updatedEvents = outboxEventRepository.findAll();
        assertThat(updatedEvents).anyMatch(e -> e.getType().equals("MENTORSHIP_ACCEPTED"));
    }
}

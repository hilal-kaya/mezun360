package tr.edu.btu.mezun360.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tr.edu.btu.mezun360.identity.application.DevelopmentAccountService;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.jobs.application.dto.JobPostRequest;
import tr.edu.btu.mezun360.jobs.domain.WorkModel;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class JobIntegrationTest {

    @Container static final PostgreSQLContainer<?> DB = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void db(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", DB::getJdbcUrl);
        r.add("spring.datasource.username", DB::getUsername);
        r.add("spring.datasource.password", DB::getPassword);
    }

    @LocalServerPort int port;
    @Autowired ObjectMapper mapper;
    @Autowired DevelopmentAccountService accounts;
    @Autowired JdbcTemplate jdbc;

    HttpClient client;

    @BeforeEach
    void setupData() {
        jdbc.execute("DELETE FROM mezun360.job_bookmarks");
        jdbc.execute("DELETE FROM mezun360.job_posts");
        jdbc.execute("DELETE FROM mezun360.alumni_verification_requests");
        jdbc.execute("DELETE FROM mezun360.alumni_profiles");
        jdbc.execute("DELETE FROM mezun360.user_accounts WHERE email LIKE '%@test.com'");
        client = HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL)).build();
    }

    HttpResponse<String> send(String method, String path, String body, String csrf) throws Exception {
        var req = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
        if (csrf != null) req.header("X-CSRF-TOKEN", csrf);
        if (body != null) req.header("Content-Type", "application/json");
        return client.send(req.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    String csrf() throws Exception {
        return mapper.readTree(send("GET", "/api/v1/auth/csrf", null, null).body()).path("token").asText();
    }

    void login(String email, String password) throws Exception {
        record LoginRequest(String email, String password) {}
        var response = send("POST", "/api/v1/auth/login", mapper.writeValueAsString(new LoginRequest(email, password)), csrf());
        assertThat(response.statusCode()).isEqualTo(200);
    }

    private void createUser(String email, String role, String verifyStatus) {
        UUID userId = accounts.create(email, "Synthetic-M2A-test-password-472!", Role.valueOf(role));
        if (!"ADMIN".equals(role)) {
            UUID profileId = UUID.randomUUID();
            jdbc.update("INSERT INTO mezun360.alumni_profiles (id, user_id, first_name, last_name, created_at, updated_at, version, evidence_revision, department, graduation_year, willing_to_mentor, willing_to_share_opportunities, willing_to_speak_at_events, willing_to_support_university_projects) VALUES (?, ?, 'First', 'Last', now(), now(), 0, 1, 'Dept', 2020, false, false, false, false)", profileId, userId);
            jdbc.update("INSERT INTO mezun360.alumni_privacy_settings (profile_id, directory_opt_in, profile_visibility, created_at, updated_at, version) VALUES (?, true, 'ALUMNI_MEMBERS', now(), now(), 0)", profileId);

            if (verifyStatus != null) {
                if ("PENDING".equals(verifyStatus)) {
                    jdbc.update("INSERT INTO mezun360.alumni_verification_requests (id, profile_id, evidence_revision, evidence, status, source, submitted_at, created_at, updated_at, version) VALUES (?, ?, 1, '{}'::jsonb, ?, 'MANUAL_ADMIN', now(), now(), now(), 0)", UUID.randomUUID(), profileId, verifyStatus);
                } else {
                    jdbc.update("INSERT INTO mezun360.alumni_verification_requests (id, profile_id, evidence_revision, evidence, status, source, submitted_at, reviewed_at, reviewed_by, created_at, updated_at, version) VALUES (?, ?, 1, '{}'::jsonb, ?, 'MANUAL_ADMIN', now(), now(), ?, now(), now(), 0)", UUID.randomUUID(), profileId, verifyStatus, userId);
                }
            }
        }
    }

    @Test
    void unverifiedAlumniShouldGet403ForJobs() throws Exception {
        createUser("unverified@test.com", "ALUMNI", "PENDING");
        login("unverified@test.com", "Synthetic-M2A-test-password-472!");
        String csrfToken = csrf();

        var getRes = send("GET", "/api/v1/jobs", null, null);
        assertThat(getRes.statusCode()).isEqualTo(403);

        JobPostRequest req = new JobPostRequest("Dev", "Tech", "Remote", WorkModel.REMOTE, "Desc", "url");
        var postRes = send("POST", "/api/v1/jobs", mapper.writeValueAsString(req), csrfToken);
        assertThat(postRes.statusCode()).isEqualTo(403);
    }

    @Test
    void verifiedAlumniCanPostAndGetJobs() throws Exception {
        createUser("verified@test.com", "ALUMNI", "VERIFIED");
        login("verified@test.com", "Synthetic-M2A-test-password-472!");
        String csrfToken = csrf();

        JobPostRequest req = new JobPostRequest("Dev", "Tech", "Istanbul", WorkModel.HYBRID, "Desc", "url");
        var postRes = send("POST", "/api/v1/jobs", mapper.writeValueAsString(req), csrfToken);
        assertThat(postRes.statusCode()).isEqualTo(201);
        
        var getRes = send("GET", "/api/v1/jobs?workModel=HYBRID", null, null);
        assertThat(getRes.statusCode()).isEqualTo(200);
        assertThat(getRes.body()).contains("Dev");
        assertThat(getRes.body()).contains("Tech");
    }
}

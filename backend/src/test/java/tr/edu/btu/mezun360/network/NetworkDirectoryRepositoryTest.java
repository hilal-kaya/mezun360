package tr.edu.btu.mezun360.network;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import tr.edu.btu.mezun360.network.api.AlumniNetworkDTO;
import tr.edu.btu.mezun360.network.infrastructure.NetworkDirectoryRepository;
import static org.assertj.core.api.Assertions.assertThat;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class NetworkDirectoryRepositoryTest {

    @Container static final PostgreSQLContainer<?> DB = new PostgreSQLContainer<>("postgres:16-alpine");
    
    @DynamicPropertySource 
    static void db(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", DB::getJdbcUrl);
        r.add("spring.datasource.username", DB::getUsername);
        r.add("spring.datasource.password", DB::getPassword);
    }

    @Autowired TestRestTemplate restTemplate;
    @Autowired JdbcTemplate jdbcTemplate;
    
    @BeforeEach
    void setupData() {
        jdbcTemplate.execute("DELETE FROM mezun360.alumni_verification_requests");
        jdbcTemplate.execute("DELETE FROM mezun360.alumni_privacy_settings");
        jdbcTemplate.execute("DELETE FROM mezun360.alumni_profiles");
        jdbcTemplate.execute("DELETE FROM mezun360.user_accounts WHERE email LIKE '%@test.com'");
        
        insertUserAndProfile("admin@test.com", "ADMIN", "Test", "Admin", true, "ALUMNI_MEMBERS", "VERIFIED");
        insertUserAndProfile("alumni1@test.com", "ALUMNI", "Ahmet", "Yılmaz", true, "ALUMNI_MEMBERS", "VERIFIED");
        insertUserAndProfile("alumni2@test.com", "ALUMNI", "Mehmet", "Kaya", false, "ALUMNI_MEMBERS", "VERIFIED"); // opted out
        insertUserAndProfile("alumni3@test.com", "ALUMNI", "Ayşe", "Demir", true, "PRIVATE", "VERIFIED"); // private
        insertUserAndProfile("alumni4@test.com", "ALUMNI", "Fatma", "Şahin", true, "ALUMNI_MEMBERS", "PENDING"); // unverified
    }
    
    private void insertUserAndProfile(String email, String role, String first, String last, boolean optIn, String visibility, String status) {
        UUID userId = UUID.randomUUID();
        jdbcTemplate.update("INSERT INTO mezun360.user_accounts (id, email, email_canonical, password_hash, role, created_at, updated_at, version) VALUES (?, ?, ?, '{argon2id}$argon2id$v=19$m=16384,t=2,p=1$c2FsdA$aGFzaA', ?, now(), now(), 0)", userId, email, email.toLowerCase(), role);
        UUID profileId = UUID.randomUUID();
        jdbcTemplate.update("INSERT INTO mezun360.alumni_profiles (id, user_id, first_name, last_name, created_at, updated_at, version, evidence_revision, department, graduation_year, willing_to_mentor, willing_to_share_opportunities, willing_to_speak_at_events, willing_to_support_university_projects) VALUES (?, ?, ?, ?, now(), now(), 0, 1, 'Computer Eng', 2020, false, false, false, false)", profileId, userId, first, last);
        jdbcTemplate.update("INSERT INTO mezun360.alumni_privacy_settings (profile_id, directory_opt_in, profile_visibility, created_at, updated_at, version) VALUES (?, ?, ?, now(), now(), 0)", profileId, optIn, visibility);
        if ("PENDING".equals(status)) {
            jdbcTemplate.update("INSERT INTO mezun360.alumni_verification_requests (id, profile_id, evidence_revision, evidence, status, source, submitted_at, created_at, updated_at, version) VALUES (?, ?, 1, '{}'::jsonb, ?, 'MANUAL_ADMIN', now(), now(), now(), 0)", UUID.randomUUID(), profileId, status);
        } else {
            jdbcTemplate.update("INSERT INTO mezun360.alumni_verification_requests (id, profile_id, evidence_revision, evidence, status, source, submitted_at, reviewed_at, reviewed_by, created_at, updated_at, version) VALUES (?, ?, 1, '{}'::jsonb, ?, 'MANUAL_ADMIN', now(), now(), ?, now(), now(), 0)", UUID.randomUUID(), profileId, status, userId);
        }
    }
    
    @Autowired NetworkDirectoryRepository repository;

    @Test
    void searchDirectory_ReturnsOnlyVerifiedAndOptedInAlumni() {
        var result = repository.searchDirectory(null, null, null, null, org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting("firstName").containsExactlyInAnyOrder("Test", "Ahmet");
    }
}

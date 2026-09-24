package tr.edu.btu.mezun360.identity;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.*;
import java.net.http.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tr.edu.btu.mezun360.identity.application.DevelopmentAccountService;
import tr.edu.btu.mezun360.identity.application.SessionRevocationService;
import tr.edu.btu.mezun360.identity.domain.Role;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.profiles.active=local", "mezun360.security.dev-users-enabled=false",
    "mezun360.security.account-attempts=100", "mezun360.security.source-attempts=1000"})
@Testcontainers
class AuthenticationIntegrationTest {
    @Container static final PostgreSQLContainer DB = new PostgreSQLContainer("postgres:17.9-alpine");
    @DynamicPropertySource static void db(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", DB::getJdbcUrl);
        r.add("spring.datasource.username", DB::getUsername);
        r.add("spring.datasource.password", DB::getPassword);
    }
    @LocalServerPort int port;
    @Autowired ObjectMapper mapper;
    @Autowired DevelopmentAccountService accounts;
    @Autowired SessionRevocationService sessions;
    @Autowired JdbcTemplate jdbc;
    static final String PASSWORD = "Synthetic-test-only-password-472!";
    String email;
    UUID id;
    CookieManager cookies;
    HttpClient client;
    @BeforeEach void setup() {
        email = UUID.randomUUID() + "@example.test";
        id = accounts.create(email, PASSWORD, Role.ALUMNI);
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
    String csrf() throws Exception { return mapper.readTree(send("GET", "/api/v1/auth/csrf", null, null).body()).path("token").asText(); }
    HttpResponse<String> login(String user, String password) throws Exception {
        return send("POST", "/api/v1/auth/login", mapper.writeValueAsString(Map.of("email", user, "password", password)), csrf());
    }
    @Test void alumniLoginPersistsSessionAndReturnsSafeIdentity() throws Exception {
        assertThat(login(email.toUpperCase(Locale.ROOT), PASSWORD).statusCode()).isEqualTo(200);
        var me = send("GET", "/api/v1/auth/me", null, null);
        assertThat(me.statusCode()).isEqualTo(200);
        JsonNode identity = mapper.readTree(me.body());
        assertThat(identity.path("role").asText()).isEqualTo("ALUMNI");
        assertThat(identity.path("userId").asText()).isEqualTo(id.toString());
        assertThat(me.body()).doesNotContain("password", "hash", "securityVersion");
        assertThat(send("GET", "/api/v1/alumni/security-check", null, null).statusCode()).isEqualTo(200);
        assertThat(send("GET", "/api/v1/admin/security-check", null, null).statusCode()).isEqualTo(403);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.spring_session WHERE principal_name = ?", Integer.class, id.toString())).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT password_hash FROM mezun360.user_accounts WHERE id = ?", String.class, id)).startsWith("{argon2id}$argon2id$").doesNotContain(PASSWORD);
    }
    @Test void adminAuthorizationComesFromDatabaseAndIsAudited() throws Exception {
        String admin = UUID.randomUUID() + "@example.test";
        UUID adminId = accounts.create(admin, PASSWORD, Role.ADMIN);
        assertThat(login(admin, PASSWORD).statusCode()).isEqualTo(200);
        assertThat(send("GET", "/api/v1/admin/security-check", null, null).statusCode()).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.audit_events WHERE actor_id = ? AND action = 'ADMIN_SECURITY_CHECK'", Integer.class, adminId)).isEqualTo(1);
    }
    @Test void guestIsDeniedAndErrorsContainNoQuerySecrets() throws Exception {
        for (String path : List.of("/api/v1/auth/me", "/api/v1/admin/security-check", "/api/v1/alumni/security-check")) {
            var response = send("GET", path + "?secret=do-not-reflect", null, null);
            assertThat(response.statusCode()).isEqualTo(401);
            assertThat(response.body()).contains("AUTHENTICATION_REQUIRED").doesNotContain("do-not-reflect");
        }
    }
    @Test void invalidUnknownAndInactiveAccountsHaveSameFailure() throws Exception {
        var wrong = mapper.readTree(login(email, "wrong-password").body());
        var unknown = mapper.readTree(login("unknown@example.test", PASSWORD).body());
        for (String state : List.of("PENDING_EMAIL", "SUSPENDED", "DEACTIVATED")) {
            jdbc.update("UPDATE mezun360.user_accounts SET status = ? WHERE id = ?", state, id);
            var denied = login(email, PASSWORD);
            assertThat(denied.statusCode()).isEqualTo(401);
            assertThat(mapper.readTree(denied.body()).path("detail")).isEqualTo(wrong.path("detail"));
        }
        assertThat(unknown.path("detail")).isEqualTo(wrong.path("detail"));
        assertThat(wrong.path("code").asText()).isEqualTo("INVALID_CREDENTIALS");
    }
    @Test void validationAndUnknownFieldsCannotAssignAdmin() throws Exception {
        for (String body : List.of("{\"email\":\"bad\",\"password\":\"\"}", mapper.writeValueAsString(Map.of("email",email,"password",PASSWORD,"role","ADMIN")))) {
            assertThat(send("POST", "/api/v1/auth/login", body, csrf()).statusCode()).isEqualTo(400);
        }
        assertThat(jdbc.queryForObject("SELECT role FROM mezun360.user_accounts WHERE id=?", String.class, id)).isEqualTo("ALUMNI");
        assertThatThrownBy(() -> accounts.create(email, PASSWORD, Role.ADMIN)).isInstanceOf(IllegalStateException.class);
    }
    @Test void csrfIsRequiredForLoginAndLogoutAndRotatesAtLogin() throws Exception {
        String body = mapper.writeValueAsString(Map.of("email",email,"password",PASSWORD));
        assertThat(send("POST", "/api/v1/auth/login", body, null).statusCode()).isEqualTo(403);
        String old = csrf();
        assertThat(send("POST", "/api/v1/auth/login", body, "invalid").statusCode()).isEqualTo(403);
        assertThat(send("POST", "/api/v1/auth/login", body, old).statusCode()).isEqualTo(200);
        assertThat(send("POST", "/api/v1/auth/logout", null, old).statusCode()).isEqualTo(403);
        assertThat(send("POST", "/api/v1/auth/logout", null, csrf()).statusCode()).isEqualTo(204);
        assertThat(send("GET", "/api/v1/auth/me", null, null).statusCode()).isEqualTo(401);
    }
    @Test void sessionFixationCookieFlagsAndRevocationAreEffective() throws Exception {
        var initial = send("GET", "/api/v1/auth/csrf", null, null);
        String initialCookie = initial.headers().firstValue("set-cookie").orElseThrow();
        assertThat(initialCookie).contains("HttpOnly", "SameSite=Lax", "Path=/").doesNotContain("Domain=");
        String before = cookies.getCookieStore().getCookies().getFirst().getValue();
        login(email, PASSWORD);
        assertThat(cookies.getCookieStore().getCookies().getFirst().getValue()).isNotEqualTo(before);
        sessions.revokeAll(id);
        assertThat(send("GET", "/api/v1/auth/me", null, null).statusCode()).isEqualTo(401);
    }
    @Test void accountChangesInvalidateAlreadyAuthenticatedSessions() throws Exception {
        login(email, PASSWORD);
        jdbc.update("UPDATE mezun360.user_accounts SET role='ADMIN' WHERE id=?", id);
        assertThat(send("GET", "/api/v1/admin/security-check", null, null).statusCode()).isEqualTo(401);
        login(email, PASSWORD);
        jdbc.update("UPDATE mezun360.user_accounts SET status='SUSPENDED' WHERE id=?", id);
        assertThat(send("GET", "/api/v1/auth/me", null, null).statusCode()).isEqualTo(401);
    }
    @Test void idleExpiryRejectsSession() throws Exception {
        login(email, PASSWORD);
        jdbc.update("UPDATE mezun360.spring_session SET expiry_time=0, last_access_time=0 WHERE principal_name=?", id.toString());
        assertThat(send("GET", "/api/v1/auth/me", null, null).statusCode()).isEqualTo(401);
    }
}

package tr.edu.btu.mezun360.alumni;

import static org.assertj.core.api.Assertions.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.*;
import java.net.http.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tr.edu.btu.mezun360.identity.application.DevelopmentAccountService;
import tr.edu.btu.mezun360.identity.domain.Role;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT,properties={
    "spring.profiles.active=local", "mezun360.security.dev-users-enabled=false",
    "mezun360.security.account-attempts=100", "mezun360.security.source-attempts=1000"})
@Testcontainers
class PrivacyVerificationIntegrationTest {
    @Container static final PostgreSQLContainer DB=new PostgreSQLContainer("postgres:17.9-alpine");
    @DynamicPropertySource static void db(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",DB::getJdbcUrl); r.add("spring.datasource.username",DB::getUsername); r.add("spring.datasource.password",DB::getPassword);
    }
    @LocalServerPort int port;
    @Autowired ObjectMapper mapper;
    @Autowired DevelopmentAccountService accounts;
    @Autowired JdbcTemplate jdbc;
    @Autowired Flyway flyway;
    static final String PASSWORD="Synthetic-M2A-test-password-472!";
    static final String PATH="/api/v1/me/profile";
    HttpClient client;
    UUID owner;
    String email;
    @BeforeEach void setup() {
        email=UUID.randomUUID()+"@example.test"; owner=accounts.create(email,PASSWORD,Role.ALUMNI); freshClient();
    }
    void freshClient() { client=HttpClient.newBuilder().cookieHandler(new CookieManager(null,CookiePolicy.ACCEPT_ALL)).build(); }
    HttpResponse<String> send(String method,String path,String body,String csrf,String etag) throws Exception {
        var req=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path));
        if(csrf!=null) req.header("X-CSRF-TOKEN",csrf); if(etag!=null) req.header("If-Match",etag);
        if(body!=null) req.header("Content-Type","application/json");
        return client.send(req.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
    }
    String csrf() throws Exception { return mapper.readTree(send("GET","/api/v1/auth/csrf",null,null,null).body()).path("token").asText(); }
    void login(String email) throws Exception {
        assertThat(send("POST","/api/v1/auth/login",mapper.writeValueAsString(Map.of("email",email,"password",PASSWORD)),csrf(),null).statusCode()).isEqualTo(200);
    }
    ObjectNode draft() throws Exception {
        return (ObjectNode)mapper.readTree("""
            {"firstName":"Deniz","lastName":"Örnek","department":"Bilgisayar Mühendisliği","graduationYear":2022,
            "city":"Bursa","about":"Kariyer yolculuğum.","currentCompany":"Sentetik Yazılım","currentPosition":"Geliştirici",
            "career":[{"company":"Sentetik Yazılım","position":"Geliştirici","startDate":"2022-01-01","currentlyWorking":true}],
            "education":[{"institution":"Örnek Üniversite","department":"Bilgisayar","degree":"Lisans","startYear":2018,"graduationYear":2022}],
            "skills":["Java","React"],"certifications":[{"name":"Örnek Sertifika","issuer":"Örnek Kurum","year":2024,"credentialUrl":"https://example.org/certificate"}],
            "contribution":{"willingToMentor":false}}
            """);
    }
    HttpResponse<String> put(JsonNode body,String tag) throws Exception { return send("PUT",PATH,body.toString(),csrf(),tag); }
    String tag(HttpResponse<String> response) { return response.headers().firstValue("etag").orElseThrow(); }
    static final String PRIVACY="/api/v1/me/privacy-preferences";
    static final String VERIFY="/api/v1/me/verification-requests";
    static final String ADMIN="/api/v1/admin/verification-requests";
    String adminEmail; UUID adminId;
    void admin() throws Exception {
        if(adminEmail==null) {adminEmail=UUID.randomUUID()+"@example.test";adminId=accounts.create(adminEmail,PASSWORD,Role.ADMIN);}
        freshClient();login(adminEmail);
    }
    void alumni() throws Exception {freshClient();login(email);}
    HttpResponse<String> get(String path) throws Exception {return send("GET",path,null,null,null);}
    HttpResponse<String> submit() throws Exception {return send("POST",VERIFY,"{\"confirmAccuracy\":true}",csrf(),tag(get(VERIFY)));}
    UUID submitted() throws Exception {
        alumni(); assertThat(put(draft(),"\"empty\"").statusCode()).isEqualTo(200);
        assertThat(submit().statusCode()).isEqualTo(201);
        return jdbc.queryForObject("SELECT r.id FROM mezun360.alumni_verification_requests r JOIN mezun360.alumni_profiles p ON p.id=r.profile_id WHERE p.user_id=?",UUID.class,owner);
    }
    HttpResponse<String> decide(UUID id,String status,String reason) throws Exception {
        var body=mapper.createObjectNode().put("status",status);if(reason!=null)body.put("rejectionReason",reason);
        return send("POST",ADMIN+"/"+id+"/decisions",body.toString(),csrf(),tag(get(ADMIN+"/"+id)));
    }
    @Test void privacyDefaultsAndOwnerScopePersistWithVersionAndCsrf() throws Exception {
        assertThat(get(PRIVACY).statusCode()).isEqualTo(401); alumni();
        assertThat(mapper.readTree(get(PRIVACY).body()).path("profileExists").asBoolean()).isFalse();
        put(draft(),"\"empty\""); var initial=get(PRIVACY);
        assertThat(initial.body()).contains("PRIVATE").doesNotContain("email","phone");
        assertThat(mapper.readTree(initial.body()).path("directoryOptIn").asBoolean()).isFalse();
        String body="{\"directoryOptIn\":true,\"profileVisibility\":\"ALUMNI_MEMBERS\"}";
        assertThat(send("PUT",PRIVACY,body,null,tag(initial)).statusCode()).isEqualTo(403);
        assertThat(send("PUT",PRIVACY,body,csrf(),null).statusCode()).isEqualTo(428);
        var saved=send("PUT",PRIVACY,body,csrf(),tag(initial));assertThat(saved.statusCode()).as(saved.body()).isEqualTo(200);
        assertThat(send("PUT",PRIVACY,body,csrf(),tag(initial)).statusCode()).isEqualTo(412);
        alumni();assertThat(get(PRIVACY).body()).isEqualTo(saved.body());
        String other=UUID.randomUUID()+"@example.test";accounts.create(other,PASSWORD,Role.ALUMNI);freshClient();login(other);
        assertThat(mapper.readTree(get(PRIVACY).body()).path("directoryOptIn").asBoolean()).isFalse();
        assertThat(send("PUT",PRIVACY,body,csrf(),tag(saved)).statusCode()).isEqualTo(409);
        assertThat(send("PUT",PRIVACY,"{\"userId\":\""+owner+"\",\"directoryOptIn\":true,\"profileVisibility\":\"PRIVATE\"}",csrf(),tag(saved)).statusCode()).isEqualTo(400);
        assertThat(get("/api/v1/alumni/"+owner).statusCode()).isEqualTo(403);
    }
    @Test void ownerSubmissionCannotGrantStatusOrAccessAdminAndMissingEvidenceIsClear() throws Exception {
        assertThat(get(VERIFY).statusCode()).isEqualTo(401);assertThat(get(ADMIN).statusCode()).isEqualTo(401);alumni();
        assertThat(mapper.readTree(get(VERIFY).body()).path("submitted").asBoolean()).isFalse();
        assertThat(submit().statusCode()).isEqualTo(409);
        var incomplete=draft();incomplete.putArray("education");put(incomplete,"\"empty\"");
        assertThat(submit().body()).contains("EDUCATION_REQUIRED");
        assertThat(send("POST",VERIFY,"{\"confirmAccuracy\":true,\"status\":\"VERIFIED\"}",csrf(),tag(get(VERIFY))).statusCode()).isEqualTo(400);
        assertThat(send("POST",VERIFY,"{\"confirmAccuracy\":false}",csrf(),tag(get(VERIFY))).statusCode()).isEqualTo(400);
        assertThat(get(ADMIN).statusCode()).isEqualTo(403);
        assertThat(send("POST",ADMIN+"/"+UUID.randomUUID()+"/decisions","{\"status\":\"VERIFIED\"}",csrf(),"\"v1\"").statusCode()).isEqualTo(403);
        admin();assertThat(get(VERIFY).statusCode()).isEqualTo(403);assertThat(get(PRIVACY).statusCode()).isEqualTo(403);
    }
    @Test void adminVerifiesMinimalEvidenceWithAuditAndCannotRepeatDecision() throws Exception {
        UUID id=submitted();admin();
        var queue=get(ADMIN);assertThat(queue.statusCode()).isEqualTo(200);assertThat(queue.body()).contains(id.toString()).doesNotContain("@","currentCompany","phone","career");
        var detail=get(ADMIN+"/"+id);assertThat(detail.body()).contains("Örnek Üniversite").doesNotContain("currentCompany","about","email");
        var saved=decide(id,"VERIFIED",null);assertThat(saved.statusCode()).as(saved.body()).isEqualTo(200);
        assertThat(decide(id,"VERIFIED",null).statusCode()).isEqualTo(409);
        assertThat(get(ADMIN+"?status=VERIFIED").body()).contains(id.toString());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.audit_events WHERE actor_id=? AND actor_role='ADMIN' AND target_id=? AND action='VERIFY'",Integer.class,adminId,id)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.audit_events WHERE actor_id=? AND target_id=? AND action='VERIFICATION_DETAIL_READ'",Integer.class,adminId,id)).isGreaterThan(0);
        alumni();var own=get(VERIFY);assertThat(own.body()).contains("VERIFIED").doesNotContain("reviewedBy","evidence","audit","source");
        assertThat(submit().statusCode()).isEqualTo(409);assertThat(get("/api/v1/admin/audit-events").statusCode()).isEqualTo(403);
    }
    @Test void rejectionRequiresPlainMeaningfulReasonAndSafeResubmissionPreservesHistory() throws Exception {
        UUID id=submitted();admin();
        for(String reason:Arrays.asList(null," ","short","<b>Eksik bilgi</b>","x".repeat(501))) assertThat(decide(id,"REJECTED",reason).statusCode()).isEqualTo(400);
        assertThat(decide(id,"PENDING",null).statusCode()).isEqualTo(409);
        String reason="Mezuniyet yılı ve bölüm bilgisini kontrol edin.";
        assertThat(decide(id,"REJECTED",reason).statusCode()).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.audit_events WHERE actor_id=? AND target_id=? AND action='REJECT'",Integer.class,adminId,id)).isEqualTo(1);
        alumni();assertThat(get(VERIFY).body()).contains("REJECTED",reason);assertThat(submit().statusCode()).isEqualTo(201);
        assertThat(submit().statusCode()).isEqualTo(409);
        assertThat(jdbc.queryForObject("SELECT status FROM mezun360.alumni_verification_requests WHERE id=?",String.class,id)).isEqualTo("REJECTED");
        assertThatThrownBy(() -> jdbc.update("UPDATE mezun360.alumni_verification_requests SET status='VERIFIED',rejection_reason=null WHERE id=?",id)).isInstanceOf(org.springframework.dao.DataAccessException.class);
    }
    @Test void materialEvidenceChangesInvalidateApprovalButBiographyDoesNot() throws Exception {
        UUID id=submitted();admin();assertThat(decide(id,"VERIFIED",null).statusCode()).isEqualTo(200);alumni();
        var profile=get(PATH);var body=(ObjectNode)mapper.readTree(profile.body()).path("data");body.put("about","Güncellenen biyografi");
        var saved=put(body,tag(profile));assertThat(saved.statusCode()).isEqualTo(200);assertThat(get(VERIFY).body()).contains("VERIFIED");
        body=(ObjectNode)mapper.readTree(saved.body()).path("data");((ObjectNode)body.path("education").get(0)).put("graduationYear",2023);
        assertThat(put(body,tag(saved)).statusCode()).isEqualTo(200);
        var current=mapper.readTree(get(VERIFY).body());assertThat(current.path("status").asText()).isEqualTo("PENDING");assertThat(current.path("submitted").asBoolean()).isFalse();
        assertThat(submit().statusCode()).isEqualTo(201);
        assertThat(jdbc.queryForObject("SELECT status FROM mezun360.alumni_verification_requests WHERE id=?",String.class,id)).isEqualTo("VERIFIED");
    }
    @Test void staleEvidenceCannotBeApprovedAndConcurrentDecisionsAreSerialized() throws Exception {
        UUID id=submitted();alumni();var profile=get(PATH);var body=(ObjectNode)mapper.readTree(profile.body()).path("data");body.put("department","Yeni bölüm");put(body,tag(profile));
        admin();assertThat(decide(id,"VERIFIED",null).statusCode()).isEqualTo(409);assertThat(get(ADMIN).body()).doesNotContain(id.toString());
        alumni();assertThat(submit().statusCode()).isEqualTo(201);
        UUID next=jdbc.queryForObject("SELECT r.id FROM mezun360.alumni_verification_requests r JOIN mezun360.alumni_profiles p ON p.id=r.profile_id WHERE p.user_id=? AND r.evidence_revision=p.evidence_revision",UUID.class,owner);
        admin();var detail=get(ADMIN+"/"+next);String token=csrf();
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            var a=executor.submit(() -> send("POST",ADMIN+"/"+next+"/decisions","{\"status\":\"VERIFIED\"}",token,tag(detail)));
            var b=executor.submit(() -> send("POST",ADMIN+"/"+next+"/decisions","{\"status\":\"REJECTED\",\"rejectionReason\":\"Lütfen bilgileri kontrol edin.\"}",token,tag(detail)));
            assertThat(List.of(a.get().statusCode(),b.get().statusCode())).containsExactlyInAnyOrder(200,412);
        }
    }
    @Test void adminInputsAreBoundedAndSuspendedTargetCannotBeApproved() throws Exception {
        UUID id=submitted();admin();
        for(String query:List.of("?size=51","?page=-1","?status=OTHER","?page=abc"))assertThat(get(ADMIN+query).statusCode()).isEqualTo(400);
        assertThat(get(ADMIN+"/invalid").statusCode()).isEqualTo(400);
        assertThat(get(ADMIN+"/"+UUID.randomUUID()).statusCode()).isEqualTo(404);
        assertThat(send("POST",ADMIN+"/"+id+"/decisions","{\"status\":\"VERIFIED\"}",null,tag(get(ADMIN+"/"+id))).statusCode()).isEqualTo(403);
        jdbc.update("UPDATE mezun360.user_accounts SET status='SUSPENDED' WHERE id=?",owner);
        assertThat(decide(id,"VERIFIED",null).body()).contains("ACCOUNT_INELIGIBLE");
    }
    @Test void m2aUpgradeBackfillsPrivateWithoutChangingExistingProfile() {
        jdbc.execute("CREATE DATABASE m2b_upgrade");
        String url=DB.getJdbcUrl().replace("/"+DB.getDatabaseName(),"/m2b_upgrade");
        var old=Flyway.configure().dataSource(url,DB.getUsername(),DB.getPassword()).schemas("mezun360").defaultSchema("mezun360").target("0004").load();old.migrate();
        var db=new JdbcTemplate(new DriverManagerDataSource(url,DB.getUsername(),DB.getPassword()));
        String hash=jdbc.queryForObject("SELECT password_hash FROM mezun360.user_accounts WHERE id=?",String.class,owner);
        db.update("INSERT INTO mezun360.user_accounts(id,email,email_canonical,password_hash,role,status,email_verified_at,created_at,updated_at) VALUES(?,?,?,?,'ALUMNI','ACTIVE',now(),now(),now())",owner,email,email,hash);
        UUID profile=UUID.randomUUID();db.update("INSERT INTO mezun360.alumni_profiles(id,user_id,first_name,last_name,created_at,updated_at) VALUES(?,?,'Deniz','Örnek',now(),now())",profile,owner);
        var next=Flyway.configure().dataSource(url,DB.getUsername(),DB.getPassword()).schemas("mezun360").defaultSchema("mezun360").load();assertThat(next.migrate().migrationsExecuted).isEqualTo(2);next.validate();assertThat(next.migrate().migrationsExecuted).isZero();
        var defaults=db.queryForMap("SELECT directory_opt_in,profile_visibility FROM mezun360.alumni_privacy_settings WHERE profile_id=?",profile);
        assertThat(defaults).containsEntry("directory_opt_in",false).containsEntry("profile_visibility","PRIVATE");
        assertThat(db.queryForObject("SELECT count(*) FROM mezun360.alumni_verification_requests",Integer.class)).isZero();
        assertThat(db.queryForObject("SELECT first_name FROM mezun360.alumni_profiles WHERE id=?",String.class,profile)).isEqualTo("Deniz");
    }
    @Test void auditFailureRollsBackDecisionAndBlocksProtectedRead() throws Exception {
        UUID id=submitted();admin();var detail=get(ADMIN+"/"+id);
        jdbc.execute("""
            CREATE FUNCTION mezun360.test_fail_review_audit() RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
              IF NEW.action IN ('VERIFY','REJECT','VERIFICATION_DETAIL_READ','VERIFICATION_QUEUE_READ') THEN
                RAISE EXCEPTION 'Synthetic audit failure';
              END IF;
              RETURN NEW;
            END; $$;
            CREATE TRIGGER test_audit_failure BEFORE INSERT ON mezun360.audit_events
            FOR EACH ROW EXECUTE FUNCTION mezun360.test_fail_review_audit();
            """);
        try {
            assertThat(send("POST",ADMIN+"/"+id+"/decisions","{\"status\":\"VERIFIED\"}",csrf(),tag(detail)).statusCode()).isGreaterThanOrEqualTo(500);
            assertThat(jdbc.queryForObject("SELECT status FROM mezun360.alumni_verification_requests WHERE id=?",String.class,id)).isEqualTo("PENDING");
            var read=get(ADMIN+"/"+id);assertThat(read.statusCode()).isGreaterThanOrEqualTo(500);assertThat(read.body()).doesNotContain("Deniz","Örnek Üniversite","Synthetic audit failure");
            assertThat(get(ADMIN).statusCode()).isGreaterThanOrEqualTo(500);
        } finally {
            jdbc.execute("DROP TRIGGER test_audit_failure ON mezun360.audit_events");
            jdbc.execute("DROP FUNCTION mezun360.test_fail_review_audit()");
        }
    }
    @Test void serverDeniesSelfReviewEvenAfterOperatorChangesRole() throws Exception {
        UUID id=submitted();
        jdbc.update("UPDATE mezun360.user_accounts SET role='ADMIN' WHERE id=?",owner);
        freshClient();login(email);
        assertThat(get(ADMIN+"/"+id).statusCode()).isEqualTo(403);
        assertThat(send("POST",ADMIN+"/"+id+"/decisions","{\"status\":\"VERIFIED\"}",csrf(),"\"any\"").statusCode()).isEqualTo(403);
        assertThat(jdbc.queryForObject("SELECT status FROM mezun360.alumni_verification_requests WHERE id=?",String.class,id)).isEqualTo("PENDING");
    }

}

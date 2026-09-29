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
class ProfileIntegrationTest {
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
    @Test void onboardingIsReadOnlyAndOwnerUpdatePersistsWithoutChangingIdentity() throws Exception {
        login(email);
        var before=jdbc.queryForMap("SELECT password_hash,role,status,security_version,email,email_verified_at FROM mezun360.user_accounts WHERE id=?",owner);
        var empty=send("GET",PATH,null,null,null);
        assertThat(empty.statusCode()).isEqualTo(200); assertThat(mapper.readTree(empty.body()).path("exists").asBoolean()).isFalse();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.alumni_profiles WHERE user_id=?",Integer.class,owner)).isZero();
        var created=put(draft(),tag(empty));
        assertThat(created.statusCode()).as(created.body()).isEqualTo(200);
        assertThat(mapper.readTree(created.body()).path("completionPercentage").asInt()).isEqualTo(100);
        assertThat(created.headers().firstValue("cache-control")).contains("no-store");
        assertThat(created.body()).doesNotContain("password","securityVersion","userId","email","session","verificationStatus");
        var read=send("GET",PATH,null,null,null); assertThat(mapper.readTree(read.body())).isEqualTo(mapper.readTree(created.body()));
        assertThat(tag(read)).isEqualTo(tag(created));
        assertThat(jdbc.queryForMap("SELECT password_hash,role,status,security_version,email,email_verified_at FROM mezun360.user_accounts WHERE id=?",owner)).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.audit_events WHERE actor_id=? AND action='PROFILE_UPDATED'",Integer.class,owner)).isEqualTo(1);
        assertThat(send("POST","/api/v1/auth/logout",null,csrf(),null).statusCode()).isEqualTo(204);
        assertThat(send("GET",PATH,null,null,null).statusCode()).isEqualTo(401);
        login(email); assertThat(mapper.readTree(send("GET",PATH,null,null,null).body())).isEqualTo(mapper.readTree(read.body()));
    }
    @Test void guestAdminAndMissingCsrfAreDeniedAndAlumniStillCannotUseAdminApi() throws Exception {
        assertThat(send("GET",PATH,null,null,null).statusCode()).isEqualTo(401);
        String admin=UUID.randomUUID()+"@example.test"; UUID adminId=accounts.create(admin,PASSWORD,Role.ADMIN); login(admin);
        assertThat(send("GET",PATH,null,null,null).statusCode()).isEqualTo(403);
        assertThat(put(draft(),"\"empty\"").statusCode()).isEqualTo(403);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.alumni_profiles WHERE user_id=?",Integer.class,adminId)).isZero();
        freshClient(); login(email);
        assertThat(send("PUT",PATH,draft().toString(),null,"\"empty\"").statusCode()).isEqualTo(403);
        assertThat(send("GET","/api/v1/admin/security-check",null,null,null).statusCode()).isEqualTo(403);
    }
    @Test void ownerCannotInjectPrivilegesOrReuseOtherOwnersNestedIds() throws Exception {
        login(email); var first=put(draft(),"\"empty\""); assertThat(first.statusCode()).isEqualTo(200);
        var otherDraft=(ObjectNode)mapper.readTree(first.body()).path("data");
        String other=UUID.randomUUID()+"@example.test"; UUID otherId=accounts.create(other,PASSWORD,Role.ALUMNI);
        freshClient(); login(other);
        var response=put(otherDraft,"\"empty\""); assertThat(response.statusCode()).isEqualTo(400);
        assertThat(response.body()).contains("Invalid record reference");
        for(String field:List.of("userId","ownerId","role","passwordHash","verificationStatus","version")) {
            var payload=draft(); payload.put(field,owner.toString());
            assertThat(put(payload,"\"empty\"").statusCode()).isEqualTo(400);
        }
        var decimalYear=draft(); decimalYear.put("graduationYear",2022.75);
        assertThat(put(decimalYear,"\"empty\"").statusCode()).isEqualTo(400);
        var nested=draft(); ((ObjectNode)nested.path("education").get(0)).put("source","INSTITUTIONAL");
        assertThat(put(nested,"\"empty\"").statusCode()).isEqualTo(400);
        var own=draft(); own.put("firstName","İkinci"); assertThat(put(own,"\"empty\"").statusCode()).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT first_name FROM mezun360.alumni_profiles WHERE user_id=?",String.class,owner)).isEqualTo("Deniz");
        assertThat(jdbc.queryForObject("SELECT first_name FROM mezun360.alumni_profiles WHERE user_id=?",String.class,otherId)).isEqualTo("İkinci");
    }
    @Test void validationRejectsBadDatesDuplicateSkillsMarkupYearsAndCredentialUrls() throws Exception {
        login(email);
        List<ObjectNode> invalid=new ArrayList<>();
        var name=draft(); name.put("firstName"," "); invalid.add(name);
        var year=draft(); year.put("graduationYear",3000); invalid.add(year);
        var career=draft(); var c=(ObjectNode)career.path("career").get(0); c.put("currentlyWorking",false); c.put("endDate","2021-01-01"); invalid.add(career);
        var current=draft(); ((ObjectNode)current.path("career").get(0)).put("endDate","2024-01-01"); invalid.add(current);
        var duplicate=draft(); duplicate.putArray("skills").add("Java").add(" java "); invalid.add(duplicate);
        var skills=draft(); for(int i=0;i<51;i++) skills.withArray("skills").add("skill"+i); invalid.add(skills);
        var html=draft(); ((ObjectNode)html.path("career").get(0)).put("description","<script>private-value</script>"); invalid.add(html);
        var education=draft(); ((ObjectNode)education.path("education").get(0)).put("graduationYear",1901); invalid.add(education);
        for(String url:List.of("javascript:alert(1)","https://user:password@example.org/x","http://example.org/x","https://127.0.0.1/x","https://localhost/x","not-a-url")) {
            var cert=draft(); ((ObjectNode)cert.path("certifications").get(0)).put("credentialUrl",url); invalid.add(cert);
        }
        for(var body:invalid) {
            var response=put(body,"\"empty\""); assertThat(response.statusCode()).as(response.body()).isEqualTo(400);
            assertThat(mapper.readTree(response.body()).path("errors").size()).isGreaterThan(0);
            assertThat(response.body()).contains("VALIDATION_FAILED").doesNotContain("private-value","password@example");
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.alumni_profiles WHERE user_id=?",Integer.class,owner)).isZero();
    }
    @Test void requiredEtagProtectsCreationAndConcurrentUpdates() throws Exception {
        login(email);
        assertThat(put(draft(),null).statusCode()).isEqualTo(428);
        assertThat(put(draft(),"*").statusCode()).isEqualTo(412);
        String token=csrf(); String payload=draft().toString();
        try(var executor=Executors.newVirtualThreadPerTaskExecutor()) {
            var a=executor.submit(() -> send("PUT",PATH,payload,token,"\"empty\""));
            var b=executor.submit(() -> send("PUT",PATH,payload,token,"\"empty\""));
            assertThat(List.of(a.get().statusCode(),b.get().statusCode())).containsExactlyInAnyOrder(200,412);
        }
        var current=send("GET",PATH,null,null,null); var changed=(ObjectNode)mapper.readTree(current.body()).path("data"); changed.put("about","Yeni açıklama");
        var saved=put(changed,tag(current)); assertThat(saved.statusCode()).isEqualTo(200); assertThat(tag(saved)).isNotEqualTo(tag(current));
        assertThat(put(changed,tag(current)).statusCode()).isEqualTo(412);
        assertThat(put(changed,"\"empty\"").statusCode()).isEqualTo(412);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.audit_events WHERE actor_id=? AND action='PROFILE_UPDATED'",Integer.class,owner)).isEqualTo(2);
    }
    @Test void nestedEditingRemovalAndSkillReuseKeepOtherProfilesIntact() throws Exception {
        login(email); var first=put(draft(),"\"empty\""); var data=(ObjectNode)mapper.readTree(first.body()).path("data");
        String careerId=data.path("career").get(0).path("id").asText();
        ((ObjectNode)data.path("career").get(0)).put("position","Kıdemli Geliştirici");
        data.putArray("certifications"); data.putArray("skills").add(" java ");
        var update=put(data,tag(first)); assertThat(update.statusCode()).isEqualTo(200);
        assertThat(mapper.readTree(update.body()).path("data").path("career").get(0).path("id").asText()).isEqualTo(careerId);
        assertThat(mapper.readTree(update.body()).path("data").path("career").get(0).path("position").asText()).isEqualTo("Kıdemli Geliştirici");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.certifications c JOIN mezun360.alumni_profiles p ON p.id=c.profile_id WHERE p.user_id=?",Integer.class,owner)).isZero();
        String other=UUID.randomUUID()+"@example.test"; accounts.create(other,PASSWORD,Role.ALUMNI); freshClient(); login(other); assertThat(put(draft(),"\"empty\"").statusCode()).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.skills WHERE normalized_name='java'",Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.education_records WHERE source <> 'USER_ENTERED'",Integer.class)).isZero();
    }
    @Test void completionReflectsCategoriesAndNeverPenalizesOptionalPreferences() throws Exception {
        login(email); var data=draft(); data.putArray("career"); data.putArray("education"); data.putArray("skills"); data.putArray("certifications"); data.put("about","");
        var saved=put(data,"\"empty\""); assertThat(saved.statusCode()).isEqualTo(200);
        assertThat(mapper.readTree(saved.body()).path("completionPercentage").asInt()).isEqualTo(20);
        ((ObjectNode)data.path("contribution")).put("willingToMentor",true);
        var changed=put(data,tag(saved)); assertThat(mapper.readTree(changed.body()).path("completionPercentage").asInt()).isEqualTo(20);
        data.put("city",""); var cleared=put(data,tag(changed)); assertThat(mapper.readTree(cleared.body()).path("completionPercentage").asInt()).isZero();
    }
    @Test void upgradesExistingM1DatabaseAndValidatesChecksumsWithoutIdentityChanges() {
        jdbc.execute("CREATE DATABASE m2a_upgrade");
        String url=DB.getJdbcUrl().replace("/"+DB.getDatabaseName(),"/m2a_upgrade");
        var old=Flyway.configure().dataSource(url,DB.getUsername(),DB.getPassword()).schemas("mezun360").defaultSchema("mezun360").target("0003").load();
        old.migrate();
        var upgradeJdbc=new JdbcTemplate(new DriverManagerDataSource(url,DB.getUsername(),DB.getPassword()));
        String hash=jdbc.queryForObject("SELECT password_hash FROM mezun360.user_accounts WHERE id=?",String.class,owner);
        upgradeJdbc.update("INSERT INTO mezun360.user_accounts (id,email,email_canonical,password_hash,role,status,email_verified_at,created_at,updated_at) VALUES (?,?,?,?, 'ALUMNI','ACTIVE',now(),now(),now())",owner,email,email,hash);
        var before=upgradeJdbc.queryForMap("SELECT * FROM mezun360.user_accounts WHERE id=?",owner);
        var next=Flyway.configure().dataSource(url,DB.getUsername(),DB.getPassword()).schemas("mezun360").defaultSchema("mezun360").load();
        assertThat(next.migrate().migrationsExecuted).isEqualTo(4); next.validate(); assertThat(next.migrate().migrationsExecuted).isZero(); flyway.validate();
        assertThat(upgradeJdbc.queryForMap("SELECT * FROM mezun360.user_accounts WHERE id=?",owner)).isEqualTo(before);
        assertThat(upgradeJdbc.queryForObject("SELECT count(*) FROM mezun360.alumni_profiles",Integer.class)).isZero();
    }
}

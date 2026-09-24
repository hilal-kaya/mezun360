package tr.edu.btu.mezun360;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import com.fasterxml.jackson.databind.JsonNode;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.yaml.snakeyaml.Yaml;

@SpringBootTest(properties = {"spring.profiles.active=local", "mezun360.security.dev-users-enabled=false", "springdoc.api-docs.enabled=true", "springdoc.swagger-ui.enabled=false"})
@AutoConfigureMockMvc
@Testcontainers
class TechnicalFoundationTest {
    @Container
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17.9-alpine");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired Flyway flyway;

    @Test
    void contextStartsAndFlywayOwnsIdentityAndSessionSchema() {
        assertThat(jdbc.queryForObject("SELECT count(*) FROM mezun360.flyway_schema_history WHERE version = '0001' AND success", Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForList("SELECT table_name FROM information_schema.tables WHERE table_schema = 'mezun360'", String.class))
                .containsExactlyInAnyOrder("flyway_schema_history", "user_accounts", "audit_events", "spring_session", "spring_session_attributes");
        flyway.validate();
        assertThat(flyway.migrate().migrationsExecuted).isZero();
    }

    @Test
    void healthChecksRealPostgresAndReturnsOnlyTheContractFields() throws Exception {
        var result = mvc.perform(get("/api/v1/health").header("X-Request-ID", "untrusted-input"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/json"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andReturn();
        assertThat(mapper.readTree(result.getResponse().getContentAsString()))
                .isEqualTo(mapper.readTree("{\"status\":\"UP\",\"service\":\"mezun360-api\"}"));
        UUID.fromString(result.getResponse().getHeader("X-Request-ID"));
    }

    @Test
    void missingRouteReturnsASafeProblemWithoutQueryData() throws Exception {
        var result = mvc.perform(get("/api/v1/missing?token=private-value"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"))
                .andExpect(jsonPath("$.instance").value("/api/v1/missing"))
                .andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain("private-value", "stackTrace", "exception");
        assertThat(mapper.readTree(result.getResponse().getContentAsString()).path("traceId").asText())
                .isEqualTo(result.getResponse().getHeader("X-Request-ID"));
    }

    @Test
    void localProxyDoesNotRequireWildcardCors() throws Exception {
        mvc.perform(options("/api/v1/health").header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void openApiMatchesImplementedFoundationOperations() throws Exception {
        var response = mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var document = mapper.readTree(response);
        assertThat(document.path("paths").size()).isEqualTo(7);
        assertThat(document.at("/paths/~1api~1v1~1health/get/operationId").asText()).isEqualTo("getHealth");
        assertThat(document.path("components").path("schemas").has("HealthResponse")).isTrue();
        try (var stream = Files.newInputStream(Path.of("../contracts/openapi/mezun360.yaml"))) {
            JsonNode contract = mapper.valueToTree(new Yaml().load(stream));
            assertThat(fieldNames(document.path("paths"))).isEqualTo(fieldNames(contract.path("paths")));
            assertThat(fieldNames(document.at("/paths/~1api~1v1~1health/get/responses")))
                    .isEqualTo(fieldNames(contract.at("/paths/~1api~1v1~1health/get/responses")));
            for (String path : fieldNames(document.path("paths"))) {
                for (String method : fieldNames(document.path("paths").path(path))) {
                    var actual = document.path("paths").path(path).path(method);
                    var expected = contract.path("paths").path(path).path(method);
                    assertThat(actual.path("operationId")).isEqualTo(expected.path("operationId"));
                    assertThat(fieldNames(actual.path("responses"))).isEqualTo(fieldNames(expected.path("responses")));
                    assertThat(actual.path("security")).isEqualTo(expected.path("security"));
                }
            }
            for (String schema : fieldNames(document.path("components").path("schemas"))) {
                JsonNode expected = contract.path("components").path("schemas").path(schema);
                JsonNode actual = document.path("components").path("schemas").path(schema);
                assertThat(fieldNames(actual.path("properties"))).as(schema + " fields")
                        .isEqualTo(fieldNames(expected.path("properties")));
                assertThat(mapper.convertValue(actual.path("required"), Set.class)).as(schema + " required fields")
                        .isEqualTo(mapper.convertValue(expected.path("required"), Set.class));
                assertThat(actual.path("additionalProperties")).isEqualTo(expected.path("additionalProperties"));
                expected.path("properties").fields().forEachRemaining(property -> {
                    JsonNode actualProperty = actual.path("properties").path(property.getKey());
                    for (String key : new String[] {"type", "enum", "$ref", "items"}) {
                        assertThat(actualProperty.path(key)).as(schema + "." + property.getKey() + "." + key)
                                .isEqualTo(property.getValue().path(key));
                    }
                });
            }
        }
    }

    private Set<String> fieldNames(JsonNode node) {
        Set<String> names = new HashSet<>();
        node.fieldNames().forEachRemaining(names::add);
        return names;
    }
}

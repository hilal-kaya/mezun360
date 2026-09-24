package tr.edu.btu.mezun360.shared.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.shared.exception.ServiceUnavailableException;

@WebMvcTest(excludeAutoConfiguration = org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class, controllers = ApiExceptionHandlerTest.ProbeController.class, properties = "spring.profiles.active=test")
@Import({ApiProblems.class, ApiExceptionHandler.class, RequestIdFilter.class, ApiExceptionHandlerTest.ProbeController.class})
class ApiExceptionHandlerTest {
    @Autowired MockMvc mvc;

    @Test
    void invalidDtoIsRejectedWithoutRejectedValues() throws Exception {
        mvc.perform(post("/test/probe").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors[0].field").value("name"))
                .andExpect(jsonPath("$.errors[0].rejectedValue").doesNotExist());
    }

    @Test
    void malformedJsonUsesTheSharedProblemFormat() throws Exception {
        mvc.perform(post("/test/probe").contentType(MediaType.APPLICATION_JSON).content("{broken-sensitive-value"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("MALFORMED_JSON"))
                .andExpect(jsonPath("$.detail").value("Request body is invalid."));
    }

    @Test
    void unknownPropertiesCannotBeMassAssigned() throws Exception {
        mvc.perform(post("/test/probe").contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Synthetic\",\"role\":\"ADMIN\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("UNKNOWN_FIELD"));
    }

    @Test
    void unexpectedExceptionsNeverLeakTheirMessage() throws Exception {
        var response = mvc.perform(get("/test/unexpected"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"))
                .andExpect(header().exists("X-Request-ID"))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andReturn().getResponse();
        assertThat(response.getContentAsString()).doesNotContain("sensitive-internal-value", "IllegalStateException", "stackTrace");
    }

    @Test
    void readinessFailureUses503() throws Exception {
        mvc.perform(get("/test/unavailable"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("SERVICE_UNAVAILABLE"));
    }

    @Test
    void unsupportedMethodUsesProblemFormatAndRetainsAllowHeader() throws Exception {
        mvc.perform(delete("/test/probe"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().exists("Allow"))
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
    }

    // Deliberately test-only endpoints. Never present in the application artifact.
    @RestController
    static class ProbeController {
        record ProbeRequest(@NotBlank String name) {}

        @PostMapping("/test/probe")
        ProbeRequest validate(@Valid @RequestBody ProbeRequest input) { return input; }

        @GetMapping("/test/unexpected")
        void unexpected() { throw new IllegalStateException("sensitive-internal-value"); }

        @GetMapping("/test/unavailable")
        void unavailable() { throw new ServiceUnavailableException(); }
    }
}

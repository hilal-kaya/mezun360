package tr.edu.btu.mezun360.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.ComposedSchema;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class OpenApiConfiguration {
    @Bean
    OpenAPI foundationOpenApi(SecurityProperties properties) {
        return new OpenAPI().components(new Components().addSecuritySchemes("sessionCookie",
                new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.COOKIE).name(properties.getCookieName())))
                .info(new Info().title("BTÜ Mezun360 API").version("v1")
                .description("Session authentication and M2B owner profile, privacy and audited manual verification. Production MFA remains pending."));
    }

    @Bean
    OpenApiCustomizer securityResponses() {
        return api -> {
            for(String name : new String[]{"VerificationSummary", "AdminVerification"}) {
                var schema=api.getComponents().getSchemas().get(name);
                for(String field : new String[]{"reviewedAt","rejectionReason"}) {
                    ((Schema<?>)schema.getProperties().get(field)).setTypes(java.util.Set.of("string","null"));
                }
            }
            ((Schema<?>)api.getComponents().getSchemas().get("VerificationSummary").getProperties().get("submittedAt")).setTypes(java.util.Set.of("string","null"));
            api.getComponents().getSchemas().get("Item").setRequired(java.util.List.of("id","firstName","lastName","department","graduationYear","submittedAt","status"));
            api.getComponents().getSchemas().get("ClaimedEducation").setRequired(java.util.List.of("institution","department","degree","startYear","graduationYear"));
            ((Schema<?>)api.getComponents().getSchemas().get("ClaimedEducation").getProperties().get("graduationYear")).setTypes(java.util.Set.of("integer","null"));
            api.getComponents().getSchemas().get("VerificationSubmission").setRequired(java.util.List.of("confirmAccuracy"));
            api.getPaths().forEach((path, item) -> {
            if (path.equals("/api/v1/health")) return;
            if (path.equals("/api/v1/me/profile")) {
                // springdoc's nullable record reference needs an explicit JSON Schema union in OpenAPI 3.1.
                api.getComponents().getSchemas().get("ProfileResponse").getProperties().put("data",
                        new ComposedSchema().addAnyOfItem(new Schema<>().$ref("#/components/schemas/ProfileWrite"))
                                .addAnyOfItem(new Schema<>().types(java.util.Set.of("null"))));
                var put = item.getPut();
                for (String code : new String[]{"400", "412", "428"})
                    put.getResponses().addApiResponse(code, problem("Validation failed or version precondition missing/stale."));
                put.addParametersItem(new Parameter().name("X-CSRF-TOKEN").in("header").required(true).schema(new Schema<String>().type("string")));
                put.getParameters().stream().filter(p -> p.getName().equals("If-Match")).forEach(p -> {
                    p.setRequired(true); p.setDescription("Exact ETag from GET, including the empty onboarding tag for initial creation.");
                });
            }
            if (path.contains("privacy-preferences") || path.contains("verification-requests")) {
                item.readOperationsMap().forEach((method, operation) -> {
                    for(String code : new String[]{"400","404","409"}) operation.getResponses().addApiResponse(code,problem("Invalid request, missing resource or business conflict."));
                    if(method != io.swagger.v3.oas.models.PathItem.HttpMethod.GET) {
                        for(String code : new String[]{"412","428"}) operation.getResponses().addApiResponse(code,problem("Exact resource ETag required; stale precondition."));
                        operation.addParametersItem(new Parameter().name("X-CSRF-TOKEN").in("header").required(true).schema(new Schema<String>().type("string")));
                        operation.getParameters().stream().filter(p -> p.getName().equals("If-Match")).forEach(p -> p.setRequired(true));
                    }
                    if (!path.equals("/api/v1/admin/verification-requests")) operation.getResponses().values().stream().filter(r -> r.getContent()!=null && r.getContent().containsKey("*/*"))
                        .forEach(r -> r.addHeaderObject("ETag",new io.swagger.v3.oas.models.headers.Header().schema(new Schema<String>().type("string"))));
                });
            }
            item.readOperations().forEach(operation -> {
                operation.getResponses().addApiResponse("403", problem("CSRF token invalid, CORS rejected or access forbidden."));
                operation.getResponses().addApiResponse("500", problem("Unexpected error; sanitized detail."));
                operation.getResponses().addApiResponse("503", problem("Required dependency unavailable."));
                if (!path.endsWith("/csrf") && !path.endsWith("/logout"))
                    operation.getResponses().addApiResponse("401", problem("Authentication required or invalid credentials."));
                if (path.endsWith("/login")) {
                    operation.getResponses().addApiResponse("400", problem("Invalid payload, malformed JSON or unknown field."));
                    operation.getResponses().addApiResponse("429", problem("Too many attempts; Retry-After gives seconds to wait."));
                }
                if (path.endsWith("/login") || path.endsWith("/logout"))
                    operation.addParametersItem(new Parameter().name("X-CSRF-TOKEN").in("header").required(true)
                            .description("Masked token from GET /auth/csrf, bound to the accompanying session cookie.")
                            .schema(new Schema<String>().type("string")));
            });
        });
        };
    }

    private ApiResponse problem(String description) {
        return new ApiResponse().description(description).content(new Content().addMediaType("application/problem+json",
                new MediaType().schema(new Schema<>().$ref("#/components/schemas/ApiProblem"))));
    }
}

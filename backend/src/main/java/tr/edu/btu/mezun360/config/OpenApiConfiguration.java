package tr.edu.btu.mezun360.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
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
                .description("M1B session authentication foundation. Business APIs and production MFA are not implemented."));
    }

    @Bean
    OpenApiCustomizer securityResponses() {
        return api -> api.getPaths().forEach((path, item) -> {
            if (path.equals("/api/v1/health")) return;
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
    }

    private ApiResponse problem(String description) {
        return new ApiResponse().description(description).content(new Content().addMediaType("application/problem+json",
                new MediaType().schema(new Schema<>().$ref("#/components/schemas/ApiProblem"))));
    }
}

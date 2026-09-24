package tr.edu.btu.mezun360.shared.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class ApiProblems {
    private final ObjectMapper mapper;
    public ApiProblems(ObjectMapper mapper) { this.mapper = mapper; }

    public static String traceId(HttpServletRequest request) {
        Object id = request.getAttribute(RequestIdFilter.ATTRIBUTE);
        return id == null ? UUID.randomUUID().toString() : id.toString();
    }

    public static ApiProblem body(HttpStatus status, String code, String detail, HttpServletRequest request) {
        return new ApiProblem(URI.create("urn:mezun360:problem:" + code.toLowerCase(Locale.ROOT).replace('_', '-')),
                status.getReasonPhrase(), status.value(), detail, URI.create(request.getRequestURI()), code, traceId(request), List.of());
    }

    public void write(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String code, String detail) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/problem+json");
        response.setHeader("Cache-Control", "no-store");
        mapper.writeValue(response.getOutputStream(), body(status, code, detail, request));
    }
}

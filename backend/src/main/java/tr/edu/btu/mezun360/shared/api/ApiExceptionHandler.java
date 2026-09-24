package tr.edu.btu.mezun360.shared.api;

import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.access.AccessDeniedException;
import tr.edu.btu.mezun360.identity.application.RateLimitExceededException;
import tr.edu.btu.mezun360.shared.exception.ResourceNotFoundException;
import tr.edu.btu.mezun360.shared.exception.ServiceUnavailableException;

@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Logger LOG = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Object> authentication(AuthenticationException ex, HttpServletRequest request) {
        boolean invalid = ex instanceof BadCredentialsException;
        return problem(HttpStatus.UNAUTHORIZED, invalid ? "INVALID_CREDENTIALS" : "AUTHENTICATION_REQUIRED",
                invalid ? "Email or password is invalid." : "Authentication is required.", List.of(), new HttpHeaders(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Object> accessDenied(HttpServletRequest request) {
        return problem(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access is denied.", List.of(), new HttpHeaders(), request);
    }

    @ExceptionHandler(RateLimitExceededException.class)
    ResponseEntity<Object> rateLimit(RateLimitExceededException ex, HttpServletRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Retry-After", Long.toString(ex.retryAfter()));
        return problem(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", "Too many attempts. Try again later.", List.of(), headers, request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldViolation> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldViolation(error.getField(), error.getCode(), "Invalid field value."))
                .toList();
        return problem(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "One or more fields are invalid.",
                errors, headers, servletRequest(request));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String code = ex.getMostSpecificCause() instanceof UnrecognizedPropertyException
                ? "UNKNOWN_FIELD" : "MALFORMED_JSON";
        return problem(HttpStatus.BAD_REQUEST, code, "Request body is invalid.",
                List.of(), headers, servletRequest(request));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String code = switch (status.value()) {
            case 400 -> "VALIDATION_FAILED";
            case 404 -> "RESOURCE_NOT_FOUND";
            case 405 -> "METHOD_NOT_ALLOWED";
            case 406 -> "NOT_ACCEPTABLE";
            case 415 -> "UNSUPPORTED_MEDIA_TYPE";
            default -> status.is5xxServerError() ? "INTERNAL_ERROR" : "INVALID_REQUEST";
        };
        return problem(status, code, "The request could not be processed.", List.of(), headers,
                servletRequest(request));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<Object> constraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        var errors = ex.getConstraintViolations().stream()
                .map(violation -> new FieldViolation(violation.getPropertyPath().toString(),
                        "INVALID_VALUE", "Invalid field value."))
                .toList();
        return problem(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "One or more fields are invalid.",
                errors, new HttpHeaders(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<Object> notFound(HttpServletRequest request) {
        return problem(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "Resource not found.", List.of(),
                new HttpHeaders(), request);
    }

    @ExceptionHandler(ServiceUnavailableException.class)
    ResponseEntity<Object> unavailable(HttpServletRequest request) {
        return problem(HttpStatus.SERVICE_UNAVAILABLE, "SERVICE_UNAVAILABLE",
                "The service is temporarily unavailable.", List.of(), new HttpHeaders(), request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> unexpected(Exception ex, HttpServletRequest request) {
        // No request body, exception message, SQL or credentials in diagnostic output.
        LOG.error("Unhandled API error type={} traceId={}", ex.getClass().getSimpleName(),
                request.getAttribute(RequestIdFilter.ATTRIBUTE));
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "An unexpected error occurred.", List.of(), new HttpHeaders(), request);
    }

    private ResponseEntity<Object> problem(HttpStatusCode status, String code, String detail,
            List<FieldViolation> errors, HttpHeaders originalHeaders, HttpServletRequest request) {
        Object traceId = request.getAttribute(RequestIdFilter.ATTRIBUTE);
        ApiProblem body = new ApiProblem(
                URI.create("urn:mezun360:problem:" + code.toLowerCase(java.util.Locale.ROOT).replace('_', '-')),
                HttpStatus.valueOf(status.value()).getReasonPhrase(), status.value(), detail,
                URI.create(request.getRequestURI()), code,
                traceId == null ? UUID.randomUUID().toString() : traceId.toString(), errors);
        HttpHeaders headers = new HttpHeaders();
        headers.putAll(originalHeaders);
        headers.setContentType(MediaType.APPLICATION_PROBLEM_JSON);
        headers.setCacheControl("no-store");
        return new ResponseEntity<>(body, headers, status);
    }

    private HttpServletRequest servletRequest(WebRequest request) {
        return ((ServletWebRequest) request).getRequest();
    }
}

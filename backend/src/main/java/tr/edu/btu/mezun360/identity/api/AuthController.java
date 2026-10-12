package tr.edu.btu.mezun360.identity.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.identity.application.CurrentAccountService;
import tr.edu.btu.mezun360.identity.application.LoginService;
import tr.edu.btu.mezun360.identity.application.RegistrationService;
import tr.edu.btu.mezun360.identity.infrastructure.SessionAuthenticationService;
import tr.edu.btu.mezun360.shared.api.ApiProblems;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final LoginService login;
    private final RegistrationService registration;
    private final SessionAuthenticationService sessions;
    private final CurrentAccountService current;

    public AuthController(LoginService login, RegistrationService registration, SessionAuthenticationService sessions, CurrentAccountService current) {
        this.login = login; this.registration = registration; this.sessions = sessions; this.current = current;
    }

    @GetMapping("/csrf")
    @Operation(operationId = "getCsrf", summary = "Get a masked session-bound CSRF token")
    public CsrfResponse csrf(CsrfToken csrf, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        return new CsrfResponse(csrf.getToken(), csrf.getHeaderName());
    }

    @PostMapping("/login")
    @Operation(operationId = "login", summary = "Authenticate local credentials; CSRF required")
    public LoginResponse login(@Valid @RequestBody LoginRequest input, HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        var authentication = login.authenticate(input.email(), input.password(), request.getRemoteAddr(), ApiProblems.traceId(request));
        return sessions.login(authentication, request, response);
    }

    @PostMapping("/register")
    @Operation(operationId = "register", summary = "Register a new ALUMNI account; CSRF required")
    public LoginResponse register(@Valid @RequestBody RegisterRequest input, HttpServletRequest request, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        UUID accountId = registration.register(input.email(), input.password());
        // Automatically login the user after successful registration
        var authentication = login.authenticate(input.email(), input.password(), request.getRemoteAddr(), ApiProblems.traceId(request));
        return sessions.login(authentication, request, response);
    }

    @GetMapping("/me")
    @Operation(operationId = "getCurrentAccount", summary = "Get the authenticated account", security = @SecurityRequirement(name = "sessionCookie"))
    public CurrentAccountResponse me(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        return current.current();
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "logout", summary = "Invalidate the full or pending session; CSRF required")
    public void logout(HttpServletRequest request, HttpServletResponse response) { sessions.logout(request, response); }
}

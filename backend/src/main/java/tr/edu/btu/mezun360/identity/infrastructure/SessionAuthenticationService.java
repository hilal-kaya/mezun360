package tr.edu.btu.mezun360.identity.infrastructure;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.stereotype.Service;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.config.SecurityProperties;
import tr.edu.btu.mezun360.identity.api.LoginResponse;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.shared.api.ApiProblems;

@Service
public class SessionAuthenticationService {
    public static final String MFA_PENDING = "MEZUN360_MFA_PENDING";
    private final SecurityProperties properties;
    private final SecurityContextRepository contexts;
    private final CookieSerializer cookies;
    private final SecurityAudit audit;

    public SessionAuthenticationService(SecurityProperties properties, SecurityContextRepository contexts, CookieSerializer cookies, SecurityAudit audit) {
        this.properties = properties; this.contexts = contexts; this.cookies = cookies; this.audit = audit;
    }

    public LoginResponse login(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        var previous = request.getSession(false);
        if (previous != null) previous.invalidate();
        SecurityContextHolder.clearContext();
        var principal = (SessionPrincipal) authentication.getPrincipal();
        var session = request.getSession(true);
        if (principal.role() == Role.ADMIN && properties.isAdminMfaRequired()) {
            session.setMaxInactiveInterval(300);
            session.setAttribute(MFA_PENDING, principal);
            return new LoginResponse(false, true);
        }
        Duration idle = principal.role() == Role.ADMIN ? properties.getAdminIdle() : properties.getAlumniIdle();
        session.setMaxInactiveInterval(Math.toIntExact(idle.toSeconds()));
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contexts.saveContext(context, request, response);
        return new LoginResponse(true, false);
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        try {
            if (auth != null && auth.getPrincipal() instanceof SessionPrincipal principal)
                audit.append(principal.accountId(), principal.role().name(), "LOGOUT", "SUCCESS", ApiProblems.traceId(request));
        } finally {
            var session = request.getSession(false);
            if (session != null) session.invalidate();
            SecurityContextHolder.clearContext();
            clearCookie(request, response);
        }
    }

    public void clearCookie(HttpServletRequest request, HttpServletResponse response) {
        var cookie = new CookieSerializer.CookieValue(request, response, "");
        cookie.setCookieMaxAge(0);
        cookies.writeCookieValue(cookie);
    }
}

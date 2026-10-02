package tr.edu.btu.mezun360.config;

import java.net.URI;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import tr.edu.btu.mezun360.identity.application.AdminMfaBoundary;

@Component
public class SecurityPolicy {
    private final boolean local;

    public SecurityPolicy(SecurityProperties properties, Environment environment, AdminMfaBoundary mfa) {
        String[] profiles = environment.getActiveProfiles();
        local = profiles.length == 1 && (profiles[0].equals("local") || profiles[0].equals("dev"));
        if (Arrays.asList(profiles).contains("local") && !local) {
            throw new IllegalStateException("The local profile must not be combined with another environment.");
        }
        if (Arrays.asList(profiles).contains("dev") && !local) {
            throw new IllegalStateException("The dev profile must not be combined with another environment.");
        }
        validate(properties, local, mfa.productionReady());
    }

    public boolean isLocal() { return local; }

    static void validate(SecurityProperties p, boolean local, boolean mfaAvailable) {
        if (!List.of("Lax", "Strict").contains(p.getSameSite())) throw new IllegalStateException("SameSite must be Lax or Strict.");
        if (!p.getCookieName().matches("[A-Za-z0-9_-]{1,64}")) throw new IllegalStateException("Invalid session cookie name.");
        if (p.getCookieName().startsWith("__Host-") && !p.isCookieSecure()) throw new IllegalStateException("Host cookies require Secure.");
        for (Duration duration : List.of(p.getAlumniIdle(), p.getAdminIdle(), p.getAlumniAbsolute(), p.getAdminAbsolute(), p.getRateWindow())) {
            if (duration.toSeconds() < 1 || duration.compareTo(Duration.ofDays(1)) > 0)
                throw new IllegalStateException("Security timeouts must be at least one second and at most one day.");
        }
        if (p.getAlumniIdle().compareTo(p.getAlumniAbsolute()) > 0 || p.getAdminIdle().compareTo(p.getAdminAbsolute()) > 0)
            throw new IllegalStateException("Idle timeout cannot exceed absolute timeout.");
        if (p.getAccountAttempts() < 1 || p.getSourceAttempts() < 1) throw new IllegalStateException("Rate limits must be positive.");
        for (String origin : p.getAllowedOrigins()) {
            URI uri = URI.create(origin);
            if (origin.contains("*") || uri.getHost() == null || uri.getRawUserInfo() != null || uri.getRawQuery() != null
                    || uri.getRawFragment() != null || (uri.getRawPath() != null && !uri.getRawPath().isEmpty())
                    || !(uri.getScheme().equals("https") || local && uri.getScheme().equals("http")))
                throw new IllegalStateException("CORS requires exact HTTP(S) origins; HTTPS is required outside local development.");
        }
        if (!local) {
            if (!p.isCookieSecure() || !p.getCookieName().startsWith("__Host-")) throw new IllegalStateException("Production requires a Secure host-only session cookie.");
            if (p.isDevUsersEnabled()) throw new IllegalStateException("Development users are forbidden outside local development.");
            if (!p.isAdminMfaRequired()) throw new IllegalStateException("ADMIN MFA cannot be disabled outside local development.");
            if (!mfaAvailable) throw new IllegalStateException("Production MFA enrollment and verification are not implemented. Refusing startup.");
        }
    }
}

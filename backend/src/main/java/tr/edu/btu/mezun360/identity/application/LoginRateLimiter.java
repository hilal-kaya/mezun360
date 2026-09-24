package tr.edu.btu.mezun360.identity.application;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import org.springframework.stereotype.Component;
import tr.edu.btu.mezun360.config.SecurityProperties;

/** Bounded, process-local fixed-window limits. Requires shared enforcement before multi-instance rollout. */
@Component
public class LoginRateLimiter {
    private record Bucket(Instant expiresAt, int attempts) {}
    private final Map<String, Bucket> buckets = new HashMap<>();
    private final byte[] salt = new byte[32];
    private final Clock clock;
    private final SecurityProperties properties;
    private long calls;

    public LoginRateLimiter(Clock clock, SecurityProperties properties) {
        this.clock = clock; this.properties = properties;
        new SecureRandom().nextBytes(salt);
    }

    public synchronized void attempt(String address, String email) {
        Instant now = clock.instant();
        if (++calls % 64 == 1) buckets.entrySet().removeIf(e -> !e.getValue().expiresAt().isAfter(now));
        String source = fingerprint("source:" + address);
        String account = fingerprint("account:" + EmailCanonicalizer.canonicalize(email));
        int newKeys = (buckets.containsKey(source) ? 0 : 1) + (buckets.containsKey(account) ? 0 : 1);
        if (buckets.size() + newKeys > 10_000) throw new RateLimitExceededException(properties.getRateWindow().toSeconds());
        consume(source, properties.getSourceAttempts(), now);
        consume(account, properties.getAccountAttempts(), now);
    }

    private void consume(String key, int limit, Instant now) {
        Bucket old = buckets.get(key);
        Bucket current = old == null || !old.expiresAt().isAfter(now)
                ? new Bucket(now.plus(properties.getRateWindow()), 0) : old;
        if (current.attempts() >= limit) {
            throw new RateLimitExceededException(Math.max(1, Duration.between(now, current.expiresAt()).toSeconds()));
        }
        buckets.put(key, new Bucket(current.expiresAt(), current.attempts() + 1));
    }

    private String fingerprint(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt);
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException("SHA-256 unavailable"); }
    }
}

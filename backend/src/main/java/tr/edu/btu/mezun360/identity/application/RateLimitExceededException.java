package tr.edu.btu.mezun360.identity.application;

public class RateLimitExceededException extends RuntimeException {
    private final long retryAfter;
    public RateLimitExceededException(long retryAfter) {
        super("Too many authentication attempts.");
        this.retryAfter = retryAfter;
    }
    public long retryAfter() { return retryAfter; }
}

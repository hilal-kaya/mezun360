package tr.edu.btu.mezun360.shared.exception;

public class ServiceUnavailableException extends RuntimeException {
    public ServiceUnavailableException() {
        super("The service is temporarily unavailable.");
    }
}

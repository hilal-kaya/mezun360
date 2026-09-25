package tr.edu.btu.mezun360.shared.exception;
import java.util.List;
import tr.edu.btu.mezun360.shared.api.FieldViolation;
public class RequestRuleException extends RuntimeException {
    public final int status;
    public final String code;
    public final List<FieldViolation> errors;
    public RequestRuleException(int status, String code, List<FieldViolation> errors) {
        super(code); this.status=status; this.code=code; this.errors=List.copyOf(errors);
    }
}

package tr.edu.btu.mezun360.alumni.application;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.security.access.AccessDeniedException;
import tr.edu.btu.mezun360.identity.application.CurrentAccountService;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.shared.exception.RequestRuleException;
@Component
public class AlumniAccess {
    private final CurrentAccountService accounts;
    private final JdbcTemplate jdbc;
    public AlumniAccess(CurrentAccountService accounts,JdbcTemplate jdbc) {this.accounts=accounts;this.jdbc=jdbc;}
    public UUID actor(Role role) {
        var actor=accounts.current();
        if(actor.role()!=role) throw new AccessDeniedException("Role required.");
        return actor.userId();
    }
    public void lock(UUID owner) { jdbc.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))",Object.class,owner.toString()); }
    public static void match(String supplied,String expected) {
        if(supplied==null || supplied.isBlank()) throw error(428,"PRECONDITION_REQUIRED");
        if(!expected.equals(supplied)) throw error(412,"VERSION_CONFLICT");
    }
    public static RequestRuleException error(int status,String code) {return new RequestRuleException(status,code,List.of());}
}

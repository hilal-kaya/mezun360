package tr.edu.btu.mezun360.alumni.application;
import java.time.Instant;
import tr.edu.btu.mezun360.alumni.api.VerificationEvidence;
import tr.edu.btu.mezun360.alumni.domain.VerificationStatus;
/** Future institutional adapters normalize evidence only. They cannot grant roles or write decisions. */
public interface InstitutionalAlumniVerificationPort {
    record EvidenceResult(VerificationStatus status,String source,String reference,Instant checkedAt,String safeReason) {}
    EvidenceResult check(VerificationEvidence evidence);
}

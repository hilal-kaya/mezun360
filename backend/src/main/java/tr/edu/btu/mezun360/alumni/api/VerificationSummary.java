package tr.edu.btu.mezun360.alumni.api;
import java.time.Instant;
import tr.edu.btu.mezun360.alumni.domain.VerificationStatus;
@io.swagger.v3.oas.annotations.media.Schema(requiredProperties={"status","submitted","submittedAt","reviewedAt","rejectionReason"})
public record VerificationSummary(VerificationStatus status,boolean submitted,Instant submittedAt,Instant reviewedAt,String rejectionReason) {}

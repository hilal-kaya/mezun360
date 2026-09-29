package tr.edu.btu.mezun360.alumni.api;
import java.time.Instant;
import java.util.UUID;
import tr.edu.btu.mezun360.alumni.domain.VerificationStatus;
@io.swagger.v3.oas.annotations.media.Schema(requiredProperties={"id","evidence","status","submittedAt","reviewedAt","rejectionReason","current"})
public record AdminVerification(UUID id,VerificationEvidence evidence,VerificationStatus status,Instant submittedAt,Instant reviewedAt,String rejectionReason,boolean current) {}

package tr.edu.btu.mezun360.alumni.domain;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.UUID;
import tr.edu.btu.mezun360.alumni.api.VerificationEvidence;
@Entity @Table(name="alumni_verification_requests",schema="mezun360")
public class AlumniVerificationRequest {
    @Id public UUID id;
    public UUID profileId;
    public long evidenceRevision;
    @JdbcTypeCode(SqlTypes.JSON) public VerificationEvidence evidence;
    @Enumerated(EnumType.STRING) public VerificationStatus status=VerificationStatus.PENDING;
    public String source="MANUAL_ADMIN";
    public Instant submittedAt,reviewedAt,createdAt,updatedAt;
    public UUID reviewedBy;
    @Column(length=500) public String rejectionReason;
    @Version public long version;
}

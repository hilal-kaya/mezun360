package tr.edu.btu.mezun360.alumni.infrastructure;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import tr.edu.btu.mezun360.alumni.domain.*;
public interface VerificationRequestRepository extends JpaRepository<AlumniVerificationRequest,UUID> {
    Optional<AlumniVerificationRequest> findFirstByProfileIdAndEvidenceRevisionOrderBySubmittedAtDescIdDesc(UUID profileId,long evidenceRevision);
    @Query("select r from AlumniVerificationRequest r, AlumniProfile p where r.profileId=p.id and r.evidenceRevision=p.evidenceRevision and r.status=:status")
    Page<AlumniVerificationRequest> queue(VerificationStatus status,Pageable page);
}

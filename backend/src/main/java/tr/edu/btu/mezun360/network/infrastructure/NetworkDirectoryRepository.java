package tr.edu.btu.mezun360.network.infrastructure;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
import tr.edu.btu.mezun360.network.api.AlumniNetworkDTO;

public interface NetworkDirectoryRepository extends JpaRepository<AlumniProfile, UUID> {

    @Query("""
        SELECT new tr.edu.btu.mezun360.network.api.AlumniNetworkDTO(
            p.id, p.firstName, p.lastName, p.department, p.graduationYear,
            p.currentCompany, p.currentPosition, p.industry, p.city,
            (SELECT cr.status FROM ConnectionRequest cr WHERE cr.senderId = :currentUserId AND cr.receiverId = p.id)
        )
        FROM AlumniProfile p, PrivacySettings ps, AlumniVerificationRequest r
        WHERE ps.profileId = p.id
          AND r.profileId = p.id
          AND r.evidenceRevision = p.evidenceRevision
          AND ps.directoryOptIn = true
          AND ps.profileVisibility = tr.edu.btu.mezun360.alumni.domain.ProfileVisibility.ALUMNI_MEMBERS
          AND r.status = tr.edu.btu.mezun360.alumni.domain.VerificationStatus.VERIFIED
          AND (:#{#search == null} = true OR CONCAT(p.firstName, ' ', p.lastName) ilike CONCAT('%', :search, '%'))
          AND (:#{#department == null} = true OR p.department ilike CONCAT('%', :department, '%'))
          AND (:#{#year == null} = true OR p.graduationYear = :year)
          AND (:#{#industry == null} = true OR p.industry ilike CONCAT('%', :industry, '%'))
    """)
    Page<AlumniNetworkDTO> searchDirectory(
        @Param("currentUserId") UUID currentUserId,
        @Param("search") String search,
        @Param("department") String department,
        @Param("year") Integer year,
        @Param("industry") String industry,
        Pageable pageable
    );
}

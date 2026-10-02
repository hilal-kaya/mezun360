package tr.edu.btu.mezun360.alumni.infrastructure;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, UUID>, JpaSpecificationExecutor<AlumniProfile> {
    Optional<AlumniProfile> findByUserId(UUID userId);
}

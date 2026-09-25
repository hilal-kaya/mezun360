package tr.edu.btu.mezun360.alumni.infrastructure;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, UUID> {
    Optional<AlumniProfile> findByUserId(UUID userId);
}

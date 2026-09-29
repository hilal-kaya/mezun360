package tr.edu.btu.mezun360.alumni.infrastructure;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import tr.edu.btu.mezun360.alumni.domain.PrivacySettings;
public interface PrivacySettingsRepository extends JpaRepository<PrivacySettings,UUID> {}

package tr.edu.btu.mezun360.alumni.domain;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="alumni_privacy_settings",schema="mezun360")
public class PrivacySettings {
    @Id public UUID profileId;
    public boolean directoryOptIn;
    @Enumerated(EnumType.STRING) public ProfileVisibility profileVisibility=ProfileVisibility.PRIVATE;
    @Version public long version;
    public Instant createdAt,updatedAt;
}

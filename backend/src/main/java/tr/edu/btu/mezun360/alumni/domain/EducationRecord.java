package tr.edu.btu.mezun360.alumni.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="education_records", schema="mezun360")
public class EducationRecord {
    @Id public UUID id;
    @Column(nullable=false) public Instant createdAt;
    @Column(nullable=false) public Instant updatedAt;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="profile_id") public AlumniProfile profile;
    public String institution, department, degree;
    public Integer startYear, graduationYear;
    public String source = "USER_ENTERED";
}

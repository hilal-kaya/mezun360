package tr.edu.btu.mezun360.alumni.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="employment_records", schema="mezun360")
public class EmploymentRecord {
    @Id public UUID id;
    @Column(nullable=false) public Instant createdAt;
    @Column(nullable=false) public Instant updatedAt;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="profile_id") public AlumniProfile profile;
    public String company, position, industry, city;
    public LocalDate startDate, endDate;
    public boolean currentlyWorking;
    @Column(length=2000) public String description;
}

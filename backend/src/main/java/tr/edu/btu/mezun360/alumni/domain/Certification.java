package tr.edu.btu.mezun360.alumni.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="certifications", schema="mezun360")
public class Certification {
    @Id public UUID id;
    @Column(nullable=false) public Instant createdAt;
    @Column(nullable=false) public Instant updatedAt;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="profile_id") public AlumniProfile profile;
    public String name, issuer;
    public Integer year;
    @Column(length=2048) public String credentialUrl;
}

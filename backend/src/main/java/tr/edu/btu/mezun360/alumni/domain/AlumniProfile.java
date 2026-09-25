package tr.edu.btu.mezun360.alumni.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="alumni_profiles", schema="mezun360")
public class AlumniProfile {
    @Id public UUID id;
    @Column(nullable=false) public Instant createdAt;
    @Column(nullable=false) public Instant updatedAt;
    @Column(nullable=false, unique=true) public UUID userId;
    @Version public long version;
    public String firstName, lastName, department, city, currentCompany, currentPosition, industry;
    public Integer graduationYear;
    @Column(length=2000) public String about;
    public boolean willingToMentor, willingToShareOpportunities, willingToSpeakAtEvents, willingToSupportUniversityProjects;
    @OneToMany(mappedBy="profile", cascade=CascadeType.ALL, orphanRemoval=true)
    @OrderBy("startDate DESC, id ASC") public List<EmploymentRecord> career = new ArrayList<>();
    @OneToMany(mappedBy="profile", cascade=CascadeType.ALL, orphanRemoval=true)
    @OrderBy("startYear DESC, id ASC") public List<EducationRecord> education = new ArrayList<>();
    @OneToMany(mappedBy="profile", cascade=CascadeType.ALL, orphanRemoval=true)
    @OrderBy("year DESC, id ASC") public List<Certification> certifications = new ArrayList<>();
    @ManyToMany
    @JoinTable(name="alumni_profile_skills", schema="mezun360", joinColumns=@JoinColumn(name="profile_id"), inverseJoinColumns=@JoinColumn(name="skill_id"))
    @OrderBy("normalizedName ASC") public Set<Skill> skills = new LinkedHashSet<>();
}

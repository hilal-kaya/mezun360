package tr.edu.btu.mezun360.alumni.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.*;

@Entity
@Table(name="skills", schema="mezun360")
public class Skill {
    @Id public UUID id;
    @Column(nullable=false) public Instant createdAt;
    @Column(nullable=false) public Instant updatedAt;
    public String name;
    @Column(unique=true) public String normalizedName;
}

package tr.edu.btu.mezun360.jobs.domain;

import jakarta.persistence.*;
import tr.edu.btu.mezun360.identity.domain.UserAccount;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_posts", schema = "mezun360")
public class JobPost {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    @Column
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_model", nullable = false)
    private WorkModel workModel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "application_url", nullable = false, length = 1024)
    private String applicationUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by_id", nullable = false)
    private UserAccount postedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected JobPost() {
        // JPA
    }

    public JobPost(UUID id, String title, String company, String location, WorkModel workModel, String description, String applicationUrl, UserAccount postedBy) {
        this.id = id != null ? id : UUID.randomUUID();
        this.title = title;
        this.company = company;
        this.location = location;
        this.workModel = workModel;
        this.description = description;
        this.applicationUrl = applicationUrl;
        this.postedBy = postedBy;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    // Getters
    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getCompany() { return company; }
    public String getLocation() { return location; }
    public WorkModel getWorkModel() { return workModel; }
    public String getDescription() { return description; }
    public String getApplicationUrl() { return applicationUrl; }
    public UserAccount getPostedBy() { return postedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

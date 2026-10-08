package tr.edu.btu.mezun360.jobs.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.DynamicUpdate;
import tr.edu.btu.mezun360.identity.domain.UserAccount;

@Entity
@Table(name = "job_posts", schema = "mezun360")
@DynamicUpdate
public class JobPost {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "company", nullable = false)
    private String company;

    @Column(name = "location")
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_model", nullable = false)
    private WorkModel workModel;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
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

    protected JobPost() {}

    private String formatUrl(String url) {
        if (url == null || url.isBlank()) return url;
        url = url.trim();
        if (url.contains("@") && !url.startsWith("mailto:") && !url.startsWith("http")) {
            return "mailto:" + url;
        }
        if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:")) {
            return "https://" + url;
        }
        return url;
    }

    public JobPost(UUID id, String title, String company, String location, JobType jobType, WorkModel workModel, String description, String applicationUrl, UserAccount postedBy) {
        this.id = id != null ? id : UUID.randomUUID();
        this.title = title;
        this.company = company;
        this.location = location;
        this.jobType = jobType != null ? jobType : JobType.FULL_TIME;
        this.workModel = workModel;
        this.description = description;
        this.applicationUrl = formatUrl(applicationUrl);
        this.postedBy = postedBy;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public JobPost(UUID id, String title, String company, String location, JobType jobType, WorkModel workModel, String description, String applicationUrl, UserAccount postedBy, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.jobType = jobType != null ? jobType : JobType.FULL_TIME;
        this.workModel = workModel;
        this.description = description;
        this.applicationUrl = formatUrl(applicationUrl);
        this.postedBy = postedBy;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getCompany() { return company; }
    public String getLocation() { return location; }
    public JobType getJobType() { return jobType; }
    public WorkModel getWorkModel() { return workModel; }
    public String getDescription() { return description; }
    public String getApplicationUrl() { return applicationUrl; }
    public UserAccount getPostedBy() { return postedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

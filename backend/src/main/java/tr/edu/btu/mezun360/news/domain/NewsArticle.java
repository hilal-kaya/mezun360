package tr.edu.btu.mezun360.news.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "news_articles", schema = "mezun360")
public class NewsArticle {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "publish_date", nullable = false)
    private Instant publishDate;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column
    private String author;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    private Integer version;

    protected NewsArticle() {}

    public NewsArticle(UUID id, String title, String summary, String content, Instant publishDate, String imageUrl, String author) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.publishDate = publishDate;
        this.imageUrl = imageUrl;
        this.author = author;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getSummary() { return summary; }
    public String getContent() { return content; }
    public Instant getPublishDate() { return publishDate; }
    public String getImageUrl() { return imageUrl; }
    public String getAuthor() { return author; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}

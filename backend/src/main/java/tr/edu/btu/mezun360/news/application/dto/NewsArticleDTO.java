package tr.edu.btu.mezun360.news.application.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public record NewsArticleDTO(
    UUID id,
    String title,
    String summary,
    String content,
    ZonedDateTime publishDate,
    String imageUrl,
    String author
) {}

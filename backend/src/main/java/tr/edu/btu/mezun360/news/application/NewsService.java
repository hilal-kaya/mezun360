package tr.edu.btu.mezun360.news.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.news.application.dto.NewsArticleDTO;
import tr.edu.btu.mezun360.news.domain.NewsArticle;
import tr.edu.btu.mezun360.news.infrastructure.NewsArticleRepository;

import java.time.ZoneId;

@Service
public class NewsService {
    
    private final NewsArticleRepository newsArticleRepository;

    public NewsService(NewsArticleRepository newsArticleRepository) {
        this.newsArticleRepository = newsArticleRepository;
    }

    @Transactional(readOnly = true)
    public Page<NewsArticleDTO> getLatestNews(Pageable pageable) {
        return newsArticleRepository.findAllByOrderByPublishDateDesc(pageable)
                .map(this::toDTO);
    }

    private NewsArticleDTO toDTO(NewsArticle article) {
        return new NewsArticleDTO(
                article.getId(),
                article.getTitle(),
                article.getSummary(),
                article.getContent(),
                article.getPublishDate().atZone(ZoneId.of("UTC")),
                article.getImageUrl(),
                article.getAuthor()
        );
    }
}

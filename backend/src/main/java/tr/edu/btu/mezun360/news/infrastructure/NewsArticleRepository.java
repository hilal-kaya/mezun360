package tr.edu.btu.mezun360.news.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tr.edu.btu.mezun360.news.domain.NewsArticle;

import java.util.UUID;

public interface NewsArticleRepository extends JpaRepository<NewsArticle, UUID> {
    Page<NewsArticle> findAllByOrderByPublishDateDesc(Pageable pageable);
}

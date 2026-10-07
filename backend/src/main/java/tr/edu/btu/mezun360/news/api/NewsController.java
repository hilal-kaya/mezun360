package tr.edu.btu.mezun360.news.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tr.edu.btu.mezun360.news.application.NewsService;
import tr.edu.btu.mezun360.news.application.dto.NewsArticleDTO;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/news")
public class NewsController {

    private final NewsService newsService;

    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    @GetMapping
    public Page<NewsArticleDTO> getNews(Pageable pageable) {
        return newsService.getLatestNews(pageable);
    }

    @GetMapping("/{id}")
    public NewsArticleDTO getNewsById(@PathVariable UUID id) {
        return newsService.getNewsById(id);
    }
}

package tr.edu.btu.mezun360.jobs.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.identity.application.CurrentAccountService;
import tr.edu.btu.mezun360.jobs.application.JobService;
import tr.edu.btu.mezun360.jobs.application.dto.JobPostDTO;
import tr.edu.btu.mezun360.jobs.application.dto.JobPostRequest;
import tr.edu.btu.mezun360.jobs.domain.WorkModel;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@Tag(name = "Jobs", description = "Alumni Job Board API")
public class JobController {

    private final JobService jobService;
    private final CurrentAccountService currentAccountService;

    public JobController(JobService jobService, CurrentAccountService currentAccountService) {
        this.jobService = jobService;
        this.currentAccountService = currentAccountService;
    }

    @GetMapping
    @Operation(summary = "Search jobs (paginated)", security = @SecurityRequirement(name = "sessionCookie"))
    public Page<JobPostDTO> searchJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) tr.edu.btu.mezun360.jobs.domain.JobType jobType,
            @RequestParam(required = false) WorkModel workModel,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        return jobService.searchJobs(search, location, jobType, workModel, currentAccountService.current().userId(), PageRequest.of(page, size));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Post a new job", security = @SecurityRequirement(name = "sessionCookie"))
    public JobPostDTO createJobPost(@Valid @RequestBody JobPostRequest request) {
        return jobService.createJobPost(request, currentAccountService.current().userId());
    }

    @PostMapping("/{id}/bookmarks")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Bookmark a job", security = @SecurityRequirement(name = "sessionCookie"))
    public void addBookmark(@PathVariable UUID id) {
        jobService.addBookmark(id, currentAccountService.current().userId());
    }

    @DeleteMapping("/{id}/bookmarks")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove a job bookmark", security = @SecurityRequirement(name = "sessionCookie"))
    public void removeBookmark(@PathVariable UUID id) {
        jobService.removeBookmark(id, currentAccountService.current().userId());
    }
}

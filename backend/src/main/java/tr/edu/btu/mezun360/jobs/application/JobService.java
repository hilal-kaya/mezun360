package tr.edu.btu.mezun360.jobs.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.identity.domain.UserAccount;
import tr.edu.btu.mezun360.identity.infrastructure.UserAccountRepository;
import tr.edu.btu.mezun360.jobs.application.dto.JobPostDTO;
import tr.edu.btu.mezun360.jobs.application.dto.JobPostRequest;
import tr.edu.btu.mezun360.jobs.domain.JobBookmark;
import tr.edu.btu.mezun360.jobs.domain.JobPost;
import tr.edu.btu.mezun360.jobs.domain.WorkModel;
import tr.edu.btu.mezun360.jobs.infrastructure.JobBookmarkRepository;
import tr.edu.btu.mezun360.jobs.infrastructure.JobPostRepository;

import java.util.UUID;

@Service
public class JobService {

    private final JobPostRepository jobPostRepository;
    private final JobBookmarkRepository jobBookmarkRepository;
    private final UserAccountRepository userAccountRepository;
    private final JdbcTemplate jdbcTemplate;

    public JobService(JobPostRepository jobPostRepository, JobBookmarkRepository jobBookmarkRepository, UserAccountRepository userAccountRepository, JdbcTemplate jdbcTemplate) {
        this.jobPostRepository = jobPostRepository;
        this.jobBookmarkRepository = jobBookmarkRepository;
        this.userAccountRepository = userAccountRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    private void enforceVerifiedAlumniOrAdmin(UUID userId) {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        java.util.List<String> statuses = jdbcTemplate.query(
            "SELECT r.status FROM mezun360.alumni_verification_requests r " +
            "JOIN mezun360.alumni_profiles p ON p.id = r.profile_id " +
            "WHERE p.user_id = ? ORDER BY r.submitted_at DESC LIMIT 1",
            (rs, rowNum) -> rs.getString("status"),
            userId
        );
        
        if (statuses.isEmpty() || !"VERIFIED".equals(statuses.get(0))) {
            throw new AccessDeniedException("Only VERIFIED alumni can access the job board.");
        }
    }

    @Transactional(readOnly = true)
    public Page<JobPostDTO> searchJobs(String search, String location, tr.edu.btu.mezun360.jobs.domain.JobType jobType, WorkModel workModel, UUID currentUserId, Pageable pageable) {
        enforceVerifiedAlumniOrAdmin(currentUserId);
        
        Specification<JobPost> spec = Specification.where(null);
        if (search != null && !search.isBlank()) {
            final String searchPattern = "%" + search + "%";
            spec = spec.and((root, query, cb) -> 
                cb.or(
                    cb.like(cb.lower(root.get("title")), cb.lower(cb.literal(searchPattern))),
                    cb.like(cb.lower(root.get("company")), cb.lower(cb.literal(searchPattern)))
                )
            );
        }
        if (location != null && !location.isBlank()) {
            final String locationPattern = "%" + location + "%";
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("location")), cb.lower(cb.literal(locationPattern)))
            );
        }
        if (jobType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("jobType"), jobType));
        }
        if (workModel != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("workModel"), workModel));
        }

        return jobPostRepository.findAll(spec, pageable).map(job -> {
            boolean bookmarked = jobBookmarkRepository.existsByJobIdAndUserId(job.getId(), currentUserId);
            return new JobPostDTO(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                job.getJobType(),
                job.getWorkModel(),
                job.getDescription(),
                job.getApplicationUrl(),
                job.getCreatedAt(),
                bookmarked
            );
        });
    }

    @Transactional
    public JobPostDTO createJobPost(JobPostRequest request, UUID currentUserId) {
        enforceVerifiedAlumniOrAdmin(currentUserId);
        
        UserAccount user = userAccountRepository.findById(currentUserId).orElseThrow();
        JobPost job = new JobPost(
            null,
            request.title(),
            request.company(),
            request.location(),
            request.jobType(),
            request.workModel(),
            request.description(),
            request.applicationUrl(),
            user
        );
        job = jobPostRepository.save(job);
        
        JobPostDTO dto = new JobPostDTO(
            job.getId(),
            job.getTitle(),
            job.getCompany(),
            job.getLocation(),
            job.getJobType(),
            job.getWorkModel(),
            job.getDescription(),
            job.getApplicationUrl(),
            job.getCreatedAt(),
            false
        );

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            String payload = mapper.writeValueAsString(dto);
            jdbcTemplate.update(
                "INSERT INTO mezun360.outbox_events (id, type, aggregate_id, occurred_at, correlation_id, payload, status, retry_count, created_at, updated_at, version) " +
                "VALUES (?, ?, ?, now(), ?, ?::jsonb, 'PENDING', 0, now(), now(), 0)",
                UUID.randomUUID(), "NEW_JOB_POST", job.getId(), UUID.randomUUID(), payload
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to create outbox event", e);
        }

        return dto;
    }

    @Transactional
    public void addBookmark(UUID jobId, UUID currentUserId) {
        enforceVerifiedAlumniOrAdmin(currentUserId);
        
        if (!jobPostRepository.existsById(jobId)) {
            throw new IllegalArgumentException("Job not found");
        }
        if (!jobBookmarkRepository.existsByJobIdAndUserId(jobId, currentUserId)) {
            jobBookmarkRepository.save(new JobBookmark(jobId, currentUserId));
        }
    }

    @Transactional
    public void removeBookmark(UUID jobId, UUID currentUserId) {
        enforceVerifiedAlumniOrAdmin(currentUserId);
        
        jobBookmarkRepository.deleteByJobIdAndUserId(jobId, currentUserId);
    }
}

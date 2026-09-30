package tr.edu.btu.mezun360.jobs.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.edu.btu.mezun360.jobs.domain.JobBookmark;
import tr.edu.btu.mezun360.jobs.domain.JobBookmarkId;

import java.util.UUID;

@Repository
public interface JobBookmarkRepository extends JpaRepository<JobBookmark, JobBookmarkId> {
    void deleteByJobIdAndUserId(UUID jobId, UUID userId);
    boolean existsByJobIdAndUserId(UUID jobId, UUID userId);
}

package tr.edu.btu.mezun360.jobs.infrastructure;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.edu.btu.mezun360.jobs.domain.JobBookmark;
import tr.edu.btu.mezun360.jobs.domain.JobBookmarkId;

@Repository
public interface JobBookmarkRepository extends JpaRepository<JobBookmark, JobBookmarkId> {
    boolean existsByJobIdAndUserId(UUID jobId, UUID userId);
    void deleteByJobIdAndUserId(UUID jobId, UUID userId);
}

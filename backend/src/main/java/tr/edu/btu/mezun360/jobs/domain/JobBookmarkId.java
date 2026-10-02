package tr.edu.btu.mezun360.jobs.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class JobBookmarkId implements Serializable {
    private UUID jobId;
    private UUID userId;

    public JobBookmarkId() {}

    public JobBookmarkId(UUID jobId, UUID userId) {
        this.jobId = jobId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JobBookmarkId that = (JobBookmarkId) o;
        return Objects.equals(jobId, that.jobId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(jobId, userId);
    }
}

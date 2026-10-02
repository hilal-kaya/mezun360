package tr.edu.btu.mezun360.mentorship.infrastructure;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.edu.btu.mezun360.mentorship.domain.MentorshipRequest;
import tr.edu.btu.mezun360.mentorship.domain.MentorshipStatus;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, UUID> {
    boolean existsByMentorIdAndMenteeIdAndStatusIn(UUID mentorId, UUID menteeId, List<MentorshipStatus> statuses);
    Page<MentorshipRequest> findByMentorIdOrderByCreatedAtDesc(UUID mentorId, Pageable pageable);
    Page<MentorshipRequest> findByMenteeIdOrderByCreatedAtDesc(UUID menteeId, Pageable pageable);
}

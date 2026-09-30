package tr.edu.btu.mezun360.mentorship.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import tr.edu.btu.mezun360.mentorship.domain.MentorshipRequest;

import java.util.UUID;

public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, UUID> {
    Page<MentorshipRequest> findByMentorIdOrderByCreatedAtDesc(UUID mentorId, Pageable pageable);
    Page<MentorshipRequest> findByMenteeIdOrderByCreatedAtDesc(UUID menteeId, Pageable pageable);
    
    // Check if an active request already exists to prevent spam
    boolean existsByMentorIdAndMenteeIdAndStatusIn(UUID mentorId, UUID menteeId, java.util.Collection<tr.edu.btu.mezun360.mentorship.domain.MentorshipStatus> statuses);
}

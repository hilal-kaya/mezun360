package tr.edu.btu.mezun360.events.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tr.edu.btu.mezun360.events.domain.EventAttendance;
import tr.edu.btu.mezun360.events.domain.EventAttendanceStatus;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventAttendanceRepository extends JpaRepository<EventAttendance, UUID> {
    Optional<EventAttendance> findByEventIdAndUserId(UUID eventId, UUID userId);
    long countByEventIdAndStatus(UUID eventId, EventAttendanceStatus status);
}

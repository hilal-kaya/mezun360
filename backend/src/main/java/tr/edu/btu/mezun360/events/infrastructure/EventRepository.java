package tr.edu.btu.mezun360.events.infrastructure;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tr.edu.btu.mezun360.events.domain.Event;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    
    @Query("SELECT e FROM Event e WHERE e.eventDate >= :now ORDER BY e.eventDate ASC")
    Page<Event> findUpcomingEvents(@Param("now") Instant now, Pageable pageable);

    @Query("SELECT e FROM Event e WHERE e.eventDate < :now ORDER BY e.eventDate DESC")
    Page<Event> findPastEvents(@Param("now") Instant now, Pageable pageable);
}

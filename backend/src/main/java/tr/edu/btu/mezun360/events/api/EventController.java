package tr.edu.btu.mezun360.events.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.events.application.EventService;
import tr.edu.btu.mezun360.events.application.dto.EventDTO;
import tr.edu.btu.mezun360.identity.application.CurrentAccountService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {
    
    private final EventService eventService;
    private final CurrentAccountService currentAccountService;

    public EventController(EventService eventService, CurrentAccountService currentAccountService) {
        this.eventService = eventService;
        this.currentAccountService = currentAccountService;
    }

    @GetMapping
    public Page<EventDTO> getEvents(@RequestParam(defaultValue = "upcoming") String type, Pageable pageable) {
        UUID currentUserId = currentAccountService.current().userId();
        return eventService.getEvents(type, currentUserId, pageable);
    }

    @PostMapping("/{id}/attend")
    public ResponseEntity<Void> toggleAttendance(@PathVariable UUID id) {
        UUID currentUserId = currentAccountService.current().userId();
        eventService.toggleAttendance(id, currentUserId);
        return ResponseEntity.ok().build();
    }
}

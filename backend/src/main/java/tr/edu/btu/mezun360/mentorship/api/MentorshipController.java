package tr.edu.btu.mezun360.mentorship.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.identity.application.CurrentAccountService;
import tr.edu.btu.mezun360.mentorship.application.MentorshipService;
import tr.edu.btu.mezun360.mentorship.application.dto.CreateMentorshipRequestDTO;
import tr.edu.btu.mezun360.mentorship.application.dto.MentorshipRequestDTO;
import tr.edu.btu.mezun360.mentorship.application.dto.UpdateMentorshipStatusDTO;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mentorship/requests")
@Tag(name = "Mentorship", description = "Alumni Mentorship API")
public class MentorshipController {

    private final MentorshipService mentorshipService;
    private final CurrentAccountService currentAccountService;

    public MentorshipController(MentorshipService mentorshipService, CurrentAccountService currentAccountService) {
        this.mentorshipService = mentorshipService;
        this.currentAccountService = currentAccountService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Send a mentorship request", security = @SecurityRequirement(name = "sessionCookie"))
    public MentorshipRequestDTO createRequest(@Valid @RequestBody CreateMentorshipRequestDTO requestDTO) {
        return mentorshipService.createRequest(requestDTO, currentAccountService.current().userId());
    }

    @GetMapping("/incoming")
    @Operation(summary = "Get incoming mentorship requests", security = @SecurityRequirement(name = "sessionCookie"))
    public Page<MentorshipRequestDTO> getIncomingRequests(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return mentorshipService.getIncomingRequests(currentAccountService.current().userId(), PageRequest.of(page, size));
    }

    @GetMapping("/outgoing")
    @Operation(summary = "Get outgoing mentorship requests", security = @SecurityRequirement(name = "sessionCookie"))
    public Page<MentorshipRequestDTO> getOutgoingRequests(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return mentorshipService.getOutgoingRequests(currentAccountService.current().userId(), PageRequest.of(page, size));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Accept or reject a mentorship request", security = @SecurityRequirement(name = "sessionCookie"))
    public MentorshipRequestDTO updateRequestStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMentorshipStatusDTO statusDTO) {
        return mentorshipService.updateRequestStatus(id, statusDTO, currentAccountService.current().userId());
    }
}

package tr.edu.btu.mezun360.mentorship.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.mentorship.application.dto.CreateMentorshipRequestDTO;
import tr.edu.btu.mezun360.mentorship.application.dto.MentorshipRequestDTO;
import tr.edu.btu.mezun360.mentorship.application.dto.UpdateMentorshipStatusDTO;
import tr.edu.btu.mezun360.mentorship.domain.MentorshipRequest;
import tr.edu.btu.mezun360.mentorship.domain.MentorshipStatus;
import tr.edu.btu.mezun360.mentorship.infrastructure.MentorshipRequestRepository;
import tr.edu.btu.mezun360.outbox.domain.OutboxEvent;
import tr.edu.btu.mezun360.outbox.infrastructure.OutboxEventRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class MentorshipService {

    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public MentorshipService(MentorshipRequestRepository mentorshipRequestRepository,
                             OutboxEventRepository outboxEventRepository,
                             JdbcTemplate jdbcTemplate,
                             ObjectMapper objectMapper) {
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    private void enforceMentorshipEligibility(UUID userId) {
        List<Boolean> optInStatuses = jdbcTemplate.query(
            "SELECT aps.directory_opt_in FROM mezun360.alumni_profiles p " +
            "JOIN mezun360.alumni_privacy_settings aps ON p.id = aps.profile_id " +
            "JOIN mezun360.alumni_verification_requests r ON p.id = r.profile_id " +
            "WHERE p.user_id = ? AND r.status = 'VERIFIED' ORDER BY r.submitted_at DESC LIMIT 1",
            (rs, rowNum) -> rs.getBoolean("directory_opt_in"),
            userId
        );

        if (optInStatuses.isEmpty() || !optInStatuses.get(0)) {
            throw new AccessDeniedException("User is not a verified alumni or has not opted into the directory.");
        }
    }

    @Transactional
    public MentorshipRequestDTO createRequest(CreateMentorshipRequestDTO dto, UUID menteeId) {
        enforceMentorshipEligibility(menteeId);
        enforceMentorshipEligibility(dto.mentorId());

        if (menteeId.equals(dto.mentorId())) {
            throw new IllegalArgumentException("You cannot mentor yourself.");
        }

        boolean exists = mentorshipRequestRepository.existsByMentorIdAndMenteeIdAndStatusIn(
                dto.mentorId(), menteeId, List.of(MentorshipStatus.PENDING, MentorshipStatus.ACCEPTED));
        if (exists) {
            throw new IllegalStateException("An active mentorship request already exists.");
        }

        MentorshipRequest request = new MentorshipRequest(
                UUID.randomUUID(),
                dto.mentorId(),
                menteeId,
                dto.message()
        );

        MentorshipRequest saved = mentorshipRequestRepository.save(request);

        createOutboxEvent("MENTORSHIP_REQUEST_RECEIVED", saved);

        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public Page<MentorshipRequestDTO> getIncomingRequests(UUID mentorId, Pageable pageable) {
        enforceMentorshipEligibility(mentorId);
        return mentorshipRequestRepository.findByMentorIdOrderByCreatedAtDesc(mentorId, pageable)
                .map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<MentorshipRequestDTO> getOutgoingRequests(UUID menteeId, Pageable pageable) {
        enforceMentorshipEligibility(menteeId);
        return mentorshipRequestRepository.findByMenteeIdOrderByCreatedAtDesc(menteeId, pageable)
                .map(this::toDTO);
    }

    @Transactional
    public MentorshipRequestDTO updateRequestStatus(UUID requestId, UpdateMentorshipStatusDTO dto, UUID currentUserId) {
        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (!request.getMentorId().equals(currentUserId)) {
            throw new AccessDeniedException("Only the mentor can update this request's status.");
        }

        if (request.getStatus() != MentorshipStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be updated.");
        }

        if (dto.status() != MentorshipStatus.ACCEPTED && dto.status() != MentorshipStatus.REJECTED) {
            throw new IllegalArgumentException("Status must be ACCEPTED or REJECTED.");
        }

        request.updateStatus(dto.status());
        MentorshipRequest saved = mentorshipRequestRepository.save(request);

        String eventType = dto.status() == MentorshipStatus.ACCEPTED ? "MENTORSHIP_ACCEPTED" : "MENTORSHIP_REJECTED";
        createOutboxEvent(eventType, saved);

        return toDTO(saved);
    }

    private void createOutboxEvent(String type, MentorshipRequest request) {
        try {
            String payload = objectMapper.writeValueAsString(toDTO(request));
            OutboxEvent event = new OutboxEvent(
                    UUID.randomUUID(),
                    type,
                    request.getId(),
                    Instant.now(),
                    UUID.randomUUID(),
                    payload
            );
            outboxEventRepository.save(event);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize outbox event payload", e);
        }
    }

    private MentorshipRequestDTO toDTO(MentorshipRequest request) {
        return new MentorshipRequestDTO(
                request.getId(),
                request.getMentorId(),
                request.getMenteeId(),
                request.getStatus(),
                request.getMessage(),
                request.getCreatedAt().atZone(java.time.ZoneId.of("UTC"))
        );
    }
}

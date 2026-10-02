package tr.edu.btu.mezun360.mentorship.api;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.mentorship.application.MentorSearchService;

@RestController
@RequestMapping("/api/v1/mentors")
public class MentorController {

    private final MentorSearchService mentorSearchService;

    public MentorController(MentorSearchService mentorSearchService) {
        this.mentorSearchService = mentorSearchService;
    }

    @GetMapping
    public Page<MentorResponse> listMentors(
            @RequestParam(required = false) String expertise,
            Pageable pageable) {
        return mentorSearchService.searchMentors(expertise, pageable).map(MentorResponse::from);
    }
}

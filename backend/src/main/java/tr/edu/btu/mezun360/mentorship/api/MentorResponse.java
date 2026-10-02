package tr.edu.btu.mezun360.mentorship.api;

import java.util.UUID;
import java.util.List;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
import tr.edu.btu.mezun360.alumni.domain.Skill;

public record MentorResponse(
    UUID id,
    UUID userId,
    String firstName,
    String lastName,
    String title,
    String company,
    List<String> expertise
) {
    public static MentorResponse from(AlumniProfile profile) {
        return new MentorResponse(
            profile.id,
            profile.userId,
            profile.firstName,
            profile.lastName,
            profile.currentPosition,
            profile.currentCompany,
            profile.skills.stream().map(skill -> skill.name).toList()
        );
    }
}

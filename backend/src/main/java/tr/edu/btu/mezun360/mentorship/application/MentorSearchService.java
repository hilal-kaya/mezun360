package tr.edu.btu.mezun360.mentorship.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
import tr.edu.btu.mezun360.alumni.infrastructure.AlumniProfileRepository;

@Service
@Transactional(readOnly = true)
public class MentorSearchService {

    private final AlumniProfileRepository profileRepository;

    public MentorSearchService(AlumniProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public Page<AlumniProfile> searchMentors(String expertise, Pageable pageable) {
        Specification<AlumniProfile> spec = (root, query, cb) -> cb.isTrue(root.get("willingToMentor"));

        if (expertise != null && !expertise.isBlank()) {
            spec = spec.and((root, query, cb) -> {
                var skillsJoin = root.join("skills");
                return cb.like(cb.lower(skillsJoin.get("name")), "%" + expertise.toLowerCase() + "%");
            });
        }

        return profileRepository.findAll(spec, pageable);
    }
}

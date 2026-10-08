package tr.edu.btu.mezun360.mentorship.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
import tr.edu.btu.mezun360.alumni.infrastructure.AlumniProfileRepository;
import tr.edu.btu.mezun360.mentorship.api.MentorResponse;

@Service
@Transactional(readOnly = true)
public class MentorSearchService {

    private final AlumniProfileRepository profileRepository;

    public MentorSearchService(AlumniProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public Page<MentorResponse> searchMentors(String queryStr, Pageable pageable) {
        Specification<AlumniProfile> spec = (root, query, cb) -> cb.isTrue(root.get("willingToMentor"));

        if (queryStr != null && !queryStr.isBlank()) {
            final String searchPattern = "%" + queryStr + "%";
            spec = spec.and((root, query, cb) -> {
                query.distinct(true);
                var skillsJoin = root.join("skills", jakarta.persistence.criteria.JoinType.LEFT);
                return cb.or(
                    cb.like(cb.lower(root.get("firstName")), cb.lower(cb.literal(searchPattern))),
                    cb.like(cb.lower(root.get("lastName")), cb.lower(cb.literal(searchPattern))),
                    cb.like(cb.lower(root.get("currentCompany")), cb.lower(cb.literal(searchPattern))),
                    cb.like(cb.lower(root.get("currentPosition")), cb.lower(cb.literal(searchPattern))),
                    cb.like(cb.lower(skillsJoin.get("name")), cb.lower(cb.literal(searchPattern)))
                );
            });
        }

        return profileRepository.findAll(spec, pageable).map(MentorResponse::from);
    }
}

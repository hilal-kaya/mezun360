package tr.edu.btu.mezun360.alumni.application;

import jakarta.persistence.EntityManager;
import java.time.Clock;
import java.util.*;
import java.util.function.Function;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.alumni.api.*;
import tr.edu.btu.mezun360.alumni.api.ProfileWrite.*;
import tr.edu.btu.mezun360.alumni.domain.*;
import tr.edu.btu.mezun360.alumni.infrastructure.AlumniProfileRepository;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.identity.application.CurrentAccountService;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.shared.api.FieldViolation;
import tr.edu.btu.mezun360.shared.exception.RequestRuleException;
import static tr.edu.btu.mezun360.alumni.application.ProfileRules.text;

@Service
@PreAuthorize("hasRole('ALUMNI')")
public class ProfileService {
    private final AlumniProfileRepository profiles;
    private final CurrentAccountService accounts;
    private final ProfileRules rules;
    private final JdbcTemplate jdbc;
    private final EntityManager em;
    private final SecurityAudit audit;
    private final Clock clock;
    public ProfileService(AlumniProfileRepository profiles, CurrentAccountService accounts, ProfileRules rules,
            JdbcTemplate jdbc, EntityManager em, SecurityAudit audit, Clock clock) {
        this.profiles=profiles; this.accounts=accounts; this.rules=rules; this.jdbc=jdbc; this.em=em; this.audit=audit; this.clock=clock;
    }
    public record Result(ProfileResponse body, String etag) {}
    private UUID owner() {
        var current=accounts.current();
        if(current.role()!=Role.ALUMNI) throw new AccessDeniedException("Alumni only.");
        return current.userId();
    }
    @Transactional(readOnly=true, isolation=Isolation.REPEATABLE_READ)
    public Result get() {
        return profiles.findByUserId(owner()).map(this::result)
            .orElseGet(() -> new Result(new ProfileResponse(false,null,0,null,null), "\"empty\""));
    }
    @Transactional
    public Result save(ProfileWrite input, String ifMatch, String traceId) {
        UUID owner=owner();
        if(ifMatch==null || ifMatch.isBlank()) throw new RequestRuleException(428,"PRECONDITION_REQUIRED",List.of());
        rules.validate(input);
        // Serialize writes per owner, including the first creation where no profile row exists.
        // Hash collisions only serialize unrelated writes; they never select an owner.
        jdbc.queryForObject("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))", Object.class, owner.toString());
        var existing=profiles.findByUserId(owner());
        String expected=existing.map(this::etag).orElse("\"empty\"");
        if(!expected.equals(ifMatch)) throw new RequestRuleException(412,"VERSION_CONFLICT",List.of());
        AlumniProfile p=existing.orElseGet(() -> {
            var fresh=new AlumniProfile(); fresh.id=UUID.randomUUID(); fresh.userId=owner; fresh.createdAt=clock.instant(); return fresh;
        });
        checkIds(input.career(), CareerInput::id,p.career.stream().map(c -> c.id).toList(),"career");
        checkIds(input.education(), EducationInput::id,p.education.stream().map(c -> c.id).toList(),"education");
        checkIds(input.certifications(), CertificationInput::id,p.certifications.stream().map(c -> c.id).toList(),"certifications");
        p.firstName=text(input.firstName()); p.lastName=text(input.lastName()); p.department=text(input.department());
        p.graduationYear=input.graduationYear(); p.city=text(input.city()); p.currentCompany=text(input.currentCompany());
        p.currentPosition=text(input.currentPosition()); p.industry=text(input.industry()); p.about=text(input.about());
        p.updatedAt=clock.instant();
        var contribution=input.contribution(); p.willingToMentor=contribution.willingToMentor();
        p.willingToShareOpportunities=contribution.willingToShareOpportunities(); p.willingToSpeakAtEvents=contribution.willingToSpeakAtEvents();
        p.willingToSupportUniversityProjects=contribution.willingToSupportUniversityProjects();
        p.career.removeIf(c -> input.career().stream().noneMatch(i -> c.id.equals(i.id())));
        for(var c:input.career()) {
            var row=p.career.stream().filter(r -> r.id.equals(c.id())).findFirst().orElseGet(() -> {
                var r=new EmploymentRecord(); r.id=UUID.randomUUID(); r.profile=p; r.createdAt=clock.instant(); p.career.add(r); return r;
            });
            row.company=text(c.company()); row.position=text(c.position()); row.industry=text(c.industry()); row.city=text(c.city());
            row.startDate=c.startDate(); row.endDate=c.endDate(); row.currentlyWorking=c.currentlyWorking(); row.description=text(c.description()); row.updatedAt=clock.instant();
        }
        p.education.removeIf(c -> input.education().stream().noneMatch(i -> c.id.equals(i.id())));
        for(var e:input.education()) {
            var row=p.education.stream().filter(r -> r.id.equals(e.id())).findFirst().orElseGet(() -> {
                var r=new EducationRecord(); r.id=UUID.randomUUID(); r.profile=p; r.createdAt=clock.instant(); p.education.add(r); return r;
            });
            row.institution=text(e.institution()); row.department=text(e.department()); row.degree=text(e.degree());
            row.startYear=e.startYear(); row.graduationYear=e.graduationYear(); row.updatedAt=clock.instant();
        }
        p.certifications.removeIf(c -> input.certifications().stream().noneMatch(i -> c.id.equals(i.id())));
        for(var c:input.certifications()) {
            var row=p.certifications.stream().filter(r -> r.id.equals(c.id())).findFirst().orElseGet(() -> {
                var r=new Certification(); r.id=UUID.randomUUID(); r.profile=p; r.createdAt=clock.instant(); p.certifications.add(r); return r;
            });
            row.name=text(c.name()); row.issuer=text(c.issuer()); row.year=c.year(); row.credentialUrl=text(c.credentialUrl()); row.updatedAt=clock.instant();
        }
        p.skills.clear();
        for(String name:input.skills().stream().sorted(Comparator.comparing(ProfileRules::normalizedSkill)).toList()) {
            String normalized=ProfileRules.normalizedSkill(name);
            jdbc.update("INSERT INTO mezun360.skills (id,name,normalized_name,created_at,updated_at) VALUES (?,?,?,?,?) ON CONFLICT (normalized_name) DO NOTHING",
                UUID.randomUUID(),text(name).replaceAll("\\s+"," "),normalized,java.sql.Timestamp.from(clock.instant()),java.sql.Timestamp.from(clock.instant()));
            UUID id=jdbc.queryForObject("SELECT id FROM mezun360.skills WHERE normalized_name=?",UUID.class,normalized);
            p.skills.add(em.find(Skill.class,id));
        }
        var saved=profiles.saveAndFlush(p);
        audit.profileUpdated(owner,saved.id,traceId);
        return result(saved);
    }
    private <T> void checkIds(List<T> values,Function<T,UUID> id,List<UUID> owned,String field) {
        Set<UUID> seen=new HashSet<>();
        for(int i=0;i<values.size();i++) {
            UUID v=id.apply(values.get(i));
            if(v!=null && (!owned.contains(v) || !seen.add(v))) throw new RequestRuleException(400,"VALIDATION_FAILED",
                List.of(new FieldViolation(field+"["+i+"].id","INVALID_VALUE","Invalid record reference.")));
        }
    }
    private String etag(AlumniProfile p) { return "\"profile-"+p.id+"-"+p.version+"\""; }
    private Result result(AlumniProfile p) {
        var body=new ProfileWrite(p.firstName,p.lastName,p.department,p.graduationYear,p.city,p.currentCompany,p.currentPosition,p.industry,p.about,
            p.career.stream().sorted(Comparator.comparing((EmploymentRecord c) -> c.startDate).reversed().thenComparing(c -> c.id))
                .map(c -> new CareerInput(c.id,c.company,c.position,c.industry,c.city,c.startDate,c.endDate,c.currentlyWorking,c.description)).toList(),
            p.education.stream().sorted(Comparator.comparing((EducationRecord e) -> e.startYear).reversed().thenComparing(e -> e.id))
                .map(e -> new EducationInput(e.id,e.institution,e.department,e.degree,e.startYear,e.graduationYear)).toList(),
            p.skills.stream().sorted(Comparator.comparing(s -> s.normalizedName)).map(s -> s.name).toList(),
            p.certifications.stream().sorted(Comparator.comparing((Certification c) -> c.year).reversed().thenComparing(c -> c.id))
                .map(c -> new CertificationInput(c.id,c.name,c.issuer,c.year,c.credentialUrl)).toList(),
            new ContributionInput(p.willingToMentor,p.willingToShareOpportunities,p.willingToSpeakAtEvents,p.willingToSupportUniversityProjects));
        return new Result(new ProfileResponse(true,body,rules.completion(body),p.createdAt,p.updatedAt),etag(p));
    }
}

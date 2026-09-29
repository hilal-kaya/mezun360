package tr.edu.btu.mezun360.alumni.application;
import java.time.Clock;
import org.springframework.stereotype.Service;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.*;
import tr.edu.btu.mezun360.alumni.api.*;
import tr.edu.btu.mezun360.alumni.domain.*;
import tr.edu.btu.mezun360.alumni.infrastructure.*;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.identity.domain.Role;
@Service @PreAuthorize("hasRole('ALUMNI')")
public class PrivacyService {
    private final AlumniAccess access; private final AlumniProfileRepository profiles;
    private final PrivacySettingsRepository privacy; private final Clock clock; private final SecurityAudit audit;
    public PrivacyService(AlumniAccess access,AlumniProfileRepository profiles,PrivacySettingsRepository privacy,Clock clock,SecurityAudit audit) {
        this.access=access;this.profiles=profiles;this.privacy=privacy;this.clock=clock;this.audit=audit;
    }
    public record Result(PrivacyResponse body,String etag) {}
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public Result get() {
        return profiles.findByUserId(access.actor(Role.ALUMNI)).map(p -> result(privacy.findById(p.id).orElseThrow()))
            .orElse(new Result(new PrivacyResponse(false,false,ProfileVisibility.PRIVATE),"\"privacy-empty\""));
    }
    @Transactional
    public Result save(PrivacyWrite input,String etag,String trace) {
        var owner=access.actor(Role.ALUMNI); access.lock(owner);
        var profile=profiles.findByUserId(owner).orElseThrow(() -> AlumniAccess.error(409,"PROFILE_REQUIRED"));
        var setting=privacy.findById(profile.id).orElseThrow();
        AlumniAccess.match(etag,result(setting).etag());
        setting.directoryOptIn=input.directoryOptIn(); setting.profileVisibility=input.profileVisibility(); setting.updatedAt=clock.instant();
        var saved=privacy.saveAndFlush(setting); audit.alumniAction(owner,"ALUMNI",profile.id,"PRIVACY_UPDATED",trace);
        return result(saved);
    }
    private Result result(PrivacySettings s) {return new Result(new PrivacyResponse(true,s.directoryOptIn,s.profileVisibility),"\"privacy-"+s.profileId+"-"+s.version+"\"");}
}

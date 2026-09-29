package tr.edu.btu.mezun360.alumni.application;

import java.time.Clock;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import tr.edu.btu.mezun360.alumni.api.*;
import tr.edu.btu.mezun360.alumni.domain.*;
import tr.edu.btu.mezun360.alumni.infrastructure.*;
import tr.edu.btu.mezun360.audit.application.SecurityAudit;
import tr.edu.btu.mezun360.identity.application.AccountIdentityService;
import tr.edu.btu.mezun360.identity.domain.Role;
import tr.edu.btu.mezun360.shared.api.FieldViolation;
import tr.edu.btu.mezun360.shared.exception.*;

@Service
public class VerificationService {
    private final AlumniAccess access; private final AlumniProfileRepository profiles;
    private final VerificationRequestRepository requests; private final SecurityAudit audit;
    private final Clock clock; private final AccountIdentityService identities;
    public VerificationService(AlumniAccess access,AlumniProfileRepository profiles,VerificationRequestRepository requests,
            SecurityAudit audit,Clock clock,AccountIdentityService identities) {
        this.access=access;this.profiles=profiles;this.requests=requests;this.audit=audit;this.clock=clock;this.identities=identities;
    }
    public record OwnResult(VerificationSummary body,String etag) {}
    public record AdminResult(AdminVerification body,String etag) {}
    @PreAuthorize("hasRole('ALUMNI')")
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public OwnResult own() {
        return profiles.findByUserId(access.actor(Role.ALUMNI)).map(this::summary)
            .orElse(new OwnResult(new VerificationSummary(VerificationStatus.PENDING,false,null,null,null),"\"verification-empty\""));
    }
    @PreAuthorize("hasRole('ALUMNI')") @Transactional
    public OwnResult submit(String etag,String trace) {
        var owner=access.actor(Role.ALUMNI); access.lock(owner);
        var profile=profiles.findByUserId(owner).orElseThrow(() -> AlumniAccess.error(409,"PROFILE_REQUIRED"));
        var current=summary(profile); AlumniAccess.match(etag,current.etag());
        if(current.body().submitted() && current.body().status()!=VerificationStatus.REJECTED)
            throw AlumniAccess.error(409,"INVALID_TRANSITION");
        var evidence=VerificationEvidence.from(profile);
        if(evidence.department()==null || evidence.graduationYear()==null || evidence.education().isEmpty()
                || evidence.education().stream().noneMatch(e -> e.graduationYear()!=null))
            throw AlumniAccess.error(409,"EDUCATION_REQUIRED");
        var request=new AlumniVerificationRequest(); request.id=UUID.randomUUID(); request.profileId=profile.id;
        request.evidenceRevision=profile.evidenceRevision; request.evidence=evidence;
        request.submittedAt=clock.instant(); request.createdAt=request.submittedAt; request.updatedAt=request.submittedAt;
        requests.saveAndFlush(request); audit.alumniAction(owner,"ALUMNI",request.id,"VERIFICATION_SUBMITTED",trace);
        return summary(profile);
    }
    @PreAuthorize("hasRole('ADMIN')") @Transactional
    public VerificationQueue queue(VerificationStatus status,int page,int size,String trace) {
        var actor=access.actor(Role.ADMIN);
        if(page<0 || page>10000 || size<1 || size>50) throw AlumniAccess.error(400,"VALIDATION_FAILED");
        var result=requests.queue(status,PageRequest.of(page,size,Sort.by("submittedAt").ascending().and(Sort.by("id"))));
        // Audit each disclosed target, not a snapshot. Failure aborts the response.
        var items=result.getContent().stream().map(r -> {
            audit.alumniAction(actor,"ADMIN",r.id,"VERIFICATION_QUEUE_READ",trace);
            var e=r.evidence; return new VerificationQueue.Item(r.id,e.firstName(),e.lastName(),e.department(),e.graduationYear(),r.submittedAt,r.status);
        }).toList();
        return new VerificationQueue(items,page,size,result.getTotalElements());
    }
    @PreAuthorize("hasRole('ADMIN')") @Transactional
    public AdminResult detail(UUID id,String trace) {
        var actor=access.actor(Role.ADMIN); var r=requests.findById(id).orElseThrow(ResourceNotFoundException::new);
        var profile=profiles.findById(r.profileId).orElseThrow(ResourceNotFoundException::new);
        if(profile.userId.equals(actor)) throw new AccessDeniedException("Self review forbidden.");
        audit.alumniAction(actor,"ADMIN",r.id,"VERIFICATION_DETAIL_READ",trace);
        return adminResult(r,profile);
    }
    @PreAuthorize("hasRole('ADMIN')") @Transactional
    public AdminResult decide(UUID id,VerificationDecision input,String etag,String trace) {
        var actor=access.actor(Role.ADMIN);
        // Resolve the immutable owner key before locking; load mutable evidence/state only after the lock.
        var profileId=requests.findById(id).orElseThrow(ResourceNotFoundException::new).profileId;
        var profile=profiles.findById(profileId).orElseThrow(ResourceNotFoundException::new);
        if(actor.equals(profile.userId)) throw new AccessDeniedException("Self review forbidden.");
        access.lock(profile.userId);
        // A concurrent profile transaction may have completed while acquiring the advisory lock.
        emRefresh(profile);
        var r=requests.findById(id).orElseThrow(ResourceNotFoundException::new); emRefresh(r);
        if(r.evidenceRevision!=profile.evidenceRevision) throw AlumniAccess.error(409,"EVIDENCE_CHANGED");
        AlumniAccess.match(etag,adminTag(r,profile));
        if(r.status!=VerificationStatus.PENDING || input.status()==VerificationStatus.PENDING) throw AlumniAccess.error(409,"INVALID_TRANSITION");
        var target=identities.find(profile.userId).orElseThrow(ResourceNotFoundException::new);
        if(target.role()!=Role.ALUMNI || !target.canAuthenticate()) throw AlumniAccess.error(409,"ACCOUNT_INELIGIBLE");
        String reason=ProfileRules.text(input.rejectionReason());
        if(input.status()==VerificationStatus.REJECTED && (reason==null || reason.length()<10 || reason.length()>500
                || reason.matches("(?s).*[<>\\p{Cntrl}].*")))
            throw new RequestRuleException(400,"VALIDATION_FAILED",List.of(new FieldViolation("rejectionReason","INVALID_VALUE","Use 10–500 plain text characters.")));
        if(input.status()==VerificationStatus.VERIFIED && reason!=null) throw AlumniAccess.error(400,"VALIDATION_FAILED");
        r.status=input.status(); r.rejectionReason=reason; r.reviewedAt=clock.instant(); r.reviewedBy=actor; r.updatedAt=r.reviewedAt;
        requests.saveAndFlush(r); audit.alumniAction(actor,"ADMIN",r.id,r.status==VerificationStatus.VERIFIED?"VERIFY":"REJECT",trace);
        return adminResult(r,profile);
    }
    @jakarta.persistence.PersistenceContext private jakarta.persistence.EntityManager em;
    private void emRefresh(Object entity) {em.refresh(entity);}
    private OwnResult summary(AlumniProfile p) {
        return requests.findFirstByProfileIdAndEvidenceRevisionOrderBySubmittedAtDescIdDesc(p.id,p.evidenceRevision)
            .map(r -> new OwnResult(new VerificationSummary(r.status,true,r.submittedAt,r.reviewedAt,r.rejectionReason),requestTag(r)))
            .orElse(new OwnResult(new VerificationSummary(VerificationStatus.PENDING,false,null,null,null),"\"verification-"+p.id+"-revision-"+p.evidenceRevision+"\""));
    }
    private String requestTag(AlumniVerificationRequest r) {return "\"verification-"+r.id+"-"+r.version+"\"";}
    private String adminTag(AlumniVerificationRequest r,AlumniProfile p) {return "\"review-"+r.id+"-"+r.version+"-"+p.evidenceRevision+"\"";}
    private AdminResult adminResult(AlumniVerificationRequest r,AlumniProfile p) {
        return new AdminResult(new AdminVerification(r.id,r.evidence,r.status,r.submittedAt,r.reviewedAt,r.rejectionReason,r.evidenceRevision==p.evidenceRevision),adminTag(r,p));
    }
}

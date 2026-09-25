package tr.edu.btu.mezun360.alumni.application;

import java.net.URI;
import java.text.Normalizer;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Component;
import tr.edu.btu.mezun360.alumni.api.ProfileWrite;
import tr.edu.btu.mezun360.shared.api.FieldViolation;
import tr.edu.btu.mezun360.shared.exception.RequestRuleException;

@Component
public class ProfileRules {
    private final Clock clock;
    public ProfileRules(Clock clock) { this.clock=clock; }
    public static String text(String value) { return value == null || value.isBlank() ? null : value.strip(); }
    public static String normalizedSkill(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFKC).strip().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    }
    public void validate(ProfileWrite p) {
        List<FieldViolation> errors = new ArrayList<>();
        int maxYear = Year.now(clock).getValue()+1;
        checkYear(errors,"graduationYear",p.graduationYear(),maxYear);
        var skills=new HashSet<String>();
        for(int i=0;i<p.skills().size();i++) {
            String normalized=normalizedSkill(p.skills().get(i));
            if(normalized.isBlank() || normalized.length()>60 || !skills.add(normalized))
                error(errors,"skills["+i+"]","Use a unique skill of at most 60 characters.");
            plain(errors,"skills["+i+"]",p.skills().get(i));
        }
        plain(errors,"firstName",p.firstName()); plain(errors,"lastName",p.lastName());
        plain(errors,"department",p.department()); plain(errors,"city",p.city());
        plain(errors,"currentCompany",p.currentCompany()); plain(errors,"currentPosition",p.currentPosition());
        plain(errors,"industry",p.industry()); plain(errors,"about",p.about());
        for(int i=0;i<p.career().size();i++) {
            var c=p.career().get(i); String f="career["+i+"].";
            if(c.startDate().getYear()<1900 || c.startDate().isAfter(LocalDate.now(clock))) error(errors,f+"startDate","Use a past or current date from 1900.");
            if(c.currentlyWorking() && c.endDate()!=null || !c.currentlyWorking() && c.endDate()==null || c.endDate()!=null && (c.endDate().isBefore(c.startDate()) || c.endDate().isAfter(LocalDate.now(clock))))
                error(errors,f+"endDate","Check end date and current employment.");
            plain(errors,f+"company",c.company()); plain(errors,f+"position",c.position());
            plain(errors,f+"industry",c.industry()); plain(errors,f+"city",c.city()); plain(errors,f+"description",c.description());
        }
        for(int i=0;i<p.education().size();i++) {
            var e=p.education().get(i); String f="education["+i+"].";
            checkYear(errors,f+"startYear",e.startYear(),maxYear); checkYear(errors,f+"graduationYear",e.graduationYear(),maxYear);
            if(e.graduationYear()!=null && e.graduationYear()<e.startYear()) error(errors,f+"graduationYear","Graduation must follow start year.");
            plain(errors,f+"institution",e.institution()); plain(errors,f+"department",e.department()); plain(errors,f+"degree",e.degree());
        }
        for(int i=0;i<p.certifications().size();i++) {
            var c=p.certifications().get(i); String f="certifications["+i+"].";
            checkYear(errors,f+"year",c.year(),Year.now(clock).getValue());
            plain(errors,f+"name",c.name()); plain(errors,f+"issuer",c.issuer());
            if(text(c.credentialUrl())!=null && !safeUrl(c.credentialUrl())) error(errors,f+"credentialUrl","Use a public HTTPS credential URL without credentials.");
        }
        if(!errors.isEmpty()) throw new RequestRuleException(400,"VALIDATION_FAILED",errors);
    }
    static boolean safeUrl(String value) {
        try {
            URI u=URI.create(value); String host=u.getHost();
            return "https".equalsIgnoreCase(u.getScheme()) && u.getUserInfo()==null && host!=null
                && host.contains(".") && !host.endsWith(".") && !host.matches("[0-9.]+")
                && !host.startsWith("[") && !host.endsWith(".localhost") && !host.endsWith(".local")
                && !host.endsWith(".internal") && (u.getPort()==-1 || u.getPort()==443)
                && value.chars().noneMatch(c -> Character.isISOControl(c) || c=='<' || c=='>');
        } catch(IllegalArgumentException ex) { return false; }
    }
    private void checkYear(List<FieldViolation> e,String field,Integer year,int max) {
        if(year!=null && (year<1900 || year>max)) error(e,field,"Year is outside the permitted range.");
    }
    private void plain(List<FieldViolation> e,String field,String value) {
        if(value!=null && (value.contains("<") || value.contains(">") || value.chars().anyMatch(c -> Character.isISOControl(c) && c!='\n' && c!='\r' && c!='\t')))
            error(e,field,"Use plain text without markup or control characters.");
    }
    private void error(List<FieldViolation> e,String field,String message) { e.add(new FieldViolation(field,"INVALID_VALUE",message)); }
    public int completion(ProfileWrite p) {
        int value=0;
        if(text(p.firstName())!=null && text(p.lastName())!=null && text(p.department())!=null && p.graduationYear()!=null && text(p.city())!=null) value+=20;
        if(text(p.about())!=null) value+=20;
        if(!p.career().isEmpty()) value+=20;
        if(!p.education().isEmpty()) value+=20;
        if(!p.skills().isEmpty()) value+=20;
        return value;
    }
}

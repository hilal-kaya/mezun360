package tr.edu.btu.mezun360.alumni.api;
import java.util.List;
import java.util.Comparator;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
// Minimal submitted snapshot, deliberately excludes contact, career and biography.
@io.swagger.v3.oas.annotations.media.Schema(requiredProperties={"firstName","lastName","department","graduationYear","education"})
public record VerificationEvidence(String firstName,String lastName,String department,Integer graduationYear,List<ClaimedEducation> education) {
    public record ClaimedEducation(String institution,String department,String degree,Integer startYear,Integer graduationYear) {}
    public static VerificationEvidence from(AlumniProfile p) {
        return new VerificationEvidence(p.firstName,p.lastName,p.department,p.graduationYear,
            p.education.stream().map(e -> new ClaimedEducation(e.institution,e.department,e.degree,e.startYear,e.graduationYear))
                .sorted(Comparator.comparing(ClaimedEducation::toString)).toList());
    }
}

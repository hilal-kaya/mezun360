package tr.edu.btu.mezun360.alumni.api;
import java.util.List;
import java.util.UUID;
import java.time.Instant;
import tr.edu.btu.mezun360.alumni.domain.VerificationStatus;
@io.swagger.v3.oas.annotations.media.Schema(requiredProperties={"items","page","size","totalElements"})
public record VerificationQueue(List<Item> items,int page,int size,long totalElements) {
    public record Item(UUID id,String firstName,String lastName,String department,Integer graduationYear,Instant submittedAt,VerificationStatus status) {}
}

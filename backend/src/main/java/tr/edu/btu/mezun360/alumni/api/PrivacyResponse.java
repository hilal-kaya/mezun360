package tr.edu.btu.mezun360.alumni.api;
import tr.edu.btu.mezun360.alumni.domain.ProfileVisibility;
@io.swagger.v3.oas.annotations.media.Schema(requiredProperties={"profileExists","directoryOptIn","profileVisibility"})
public record PrivacyResponse(boolean profileExists,boolean directoryOptIn,ProfileVisibility profileVisibility) {}

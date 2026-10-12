package tr.edu.btu.mezun360.identity.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true) // Allows receiving firstName/lastName for now, even if not processed.
public record RegisterRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 15, max = 128) String password,
    String firstName,
    String lastName
) {}

package tr.edu.btu.mezun360.network.api;

import java.util.UUID;

public record AlumniNetworkDTO(
    UUID id,
    String firstName,
    String lastName,
    String department,
    Integer graduationYear,
    String currentCompany,
    String currentPosition,
    String industry,
    String city
) {}

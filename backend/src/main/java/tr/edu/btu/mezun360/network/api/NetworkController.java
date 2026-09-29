package tr.edu.btu.mezun360.network.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tr.edu.btu.mezun360.network.infrastructure.NetworkDirectoryRepository;

@RestController
@RequestMapping("/api/v1/network")
@Tag(name = "Alumni Network", description = "Alumni directory and networking endpoints")
public class NetworkController {

    private final NetworkDirectoryRepository repository;

    public NetworkController(NetworkDirectoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/alumni")
    @Operation(summary = "Search verified alumni directory")
    public Page<AlumniNetworkDTO> searchAlumni(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String department,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String industry,
        Pageable pageable
    ) {
        return repository.searchDirectory(
            search != null && !search.isBlank() ? search : null,
            department != null && !department.isBlank() ? department : null,
            year,
            industry != null && !industry.isBlank() ? industry : null,
            pageable
        );
    }
}

package tr.edu.btu.mezun360.network.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import tr.edu.btu.mezun360.network.infrastructure.NetworkDirectoryRepository;
import tr.edu.btu.mezun360.network.application.NetworkService;

import tr.edu.btu.mezun360.identity.application.CurrentAccountService;

@RestController
@RequestMapping("/api/v1/network")
@Tag(name = "Network")
public class NetworkController {

    private final NetworkDirectoryRepository repository;
    private final NetworkService networkService;
    private final CurrentAccountService currentAccountService;

    public NetworkController(NetworkDirectoryRepository repository, NetworkService networkService, CurrentAccountService currentAccountService) {
        this.repository = repository;
        this.networkService = networkService;
        this.currentAccountService = currentAccountService;
    }

    @GetMapping("/alumni")
    @Operation(summary = "Search verified alumni directory", security = @SecurityRequirement(name = "sessionCookie"))
    public Page<AlumniNetworkDTO> searchAlumni(
        @RequestParam(required = false) String query,
        @RequestParam(required = false, defaultValue = "0") int page,
        @RequestParam(required = false, defaultValue = "20") int size
    ) {
        return repository.searchDirectory(
            currentAccountService.current().userId(),
            query != null && !query.isBlank() ? query : null,
            org.springframework.data.domain.PageRequest.of(page, size)
        );
    }

    @PostMapping("/connections/{receiverId}")
    @Operation(summary = "Send a connection request to an alumni profile", security = @SecurityRequirement(name = "sessionCookie"))
    public void sendConnectionRequest(@PathVariable UUID receiverId) {
        networkService.sendConnectionRequest(currentAccountService.current().userId(), receiverId);
    }

    @DeleteMapping("/connections/{receiverId}")
    @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Cancel a pending connection request", security = @SecurityRequirement(name = "sessionCookie"))
    public void cancelConnectionRequest(@PathVariable UUID receiverId) {
        networkService.cancelConnectionRequest(currentAccountService.current().userId(), receiverId);
    }
}

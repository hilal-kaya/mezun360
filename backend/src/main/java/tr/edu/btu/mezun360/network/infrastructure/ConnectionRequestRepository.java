package tr.edu.btu.mezun360.network.infrastructure;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import tr.edu.btu.mezun360.network.domain.ConnectionRequest;

public interface ConnectionRequestRepository extends JpaRepository<ConnectionRequest, UUID> {
    boolean existsBySenderIdAndReceiverId(UUID senderId, UUID receiverId);
    Optional<ConnectionRequest> findBySenderIdAndReceiverId(UUID senderId, UUID receiverId);
}

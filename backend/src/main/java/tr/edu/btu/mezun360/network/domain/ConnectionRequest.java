package tr.edu.btu.mezun360.network.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "connection_requests", schema = "mezun360")
public class ConnectionRequest {
    @Id
    public UUID id;

    @Column(name = "sender_id", nullable = false)
    public UUID senderId;

    @Column(name = "receiver_id", nullable = false)
    public UUID receiverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ConnectionStatus status = ConnectionStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt;
    
    @Version
    public long version;
}

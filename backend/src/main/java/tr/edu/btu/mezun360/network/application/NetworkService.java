package tr.edu.btu.mezun360.network.application;

import java.time.Clock;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.alumni.domain.AlumniProfile;
import tr.edu.btu.mezun360.alumni.infrastructure.AlumniProfileRepository;
import tr.edu.btu.mezun360.network.domain.ConnectionRequest;
import tr.edu.btu.mezun360.network.domain.ConnectionStatus;
import tr.edu.btu.mezun360.network.infrastructure.ConnectionRequestRepository;
@Service
public class NetworkService {
    private final ConnectionRequestRepository connectionRepository;
    private final AlumniProfileRepository profileRepository;
    private final Clock clock;

    public NetworkService(ConnectionRequestRepository connectionRepository, AlumniProfileRepository profileRepository, Clock clock) {
        this.connectionRepository = connectionRepository;
        this.profileRepository = profileRepository;
        this.clock = clock;
    }

    @Transactional
    public void sendConnectionRequest(UUID senderUserId, UUID receiverProfileId) {
        AlumniProfile receiver = profileRepository.findById(receiverProfileId)
            .orElseThrow(() -> new IllegalArgumentException("Profil bulunamadı."));

        if (receiver.userId.equals(senderUserId)) {
            throw new IllegalArgumentException("Kendinize bağlantı isteği gönderemezsiniz.");
        }

        if (connectionRepository.existsBySenderIdAndReceiverId(senderUserId, receiverProfileId)) {
            throw new IllegalStateException("Bu kişiye zaten istek gönderdiniz.");
        }

        ConnectionRequest request = new ConnectionRequest();
        request.id = UUID.randomUUID();
        request.senderId = senderUserId;
        request.receiverId = receiverProfileId;
        request.status = ConnectionStatus.PENDING;
        request.createdAt = clock.instant();
        request.updatedAt = clock.instant();

        connectionRepository.save(request);
    }

    @Transactional
    public void cancelConnectionRequest(UUID senderUserId, UUID receiverProfileId) {
        ConnectionRequest request = connectionRepository.findBySenderIdAndReceiverId(senderUserId, receiverProfileId)
            .orElseThrow(() -> new IllegalArgumentException("İptal edilecek bir bağlantı isteği bulunamadı."));

        if (request.status != ConnectionStatus.PENDING) {
            throw new IllegalStateException("Sadece bekleyen istekleri iptal edebilirsiniz.");
        }

        connectionRepository.delete(request);
    }
}

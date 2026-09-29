package tr.edu.btu.mezun360.outbox.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tr.edu.btu.mezun360.outbox.application.OutboxEventHandler;
import tr.edu.btu.mezun360.outbox.domain.OutboxEvent;

@Service
public class MockLoggingNotificationAdapter implements OutboxEventHandler {
    private static final Logger log = LoggerFactory.getLogger(MockLoggingNotificationAdapter.class);

    @Override
    public void handle(OutboxEvent event) {
        log.info("Simulating notification dispatch for event ID: {}, Type: {}", event.getId(), event.getType());
        log.debug("Event Payload: {}", event.getPayload());
        // Simulating successful dispatch logic
    }
}

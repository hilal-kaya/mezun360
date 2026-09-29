package tr.edu.btu.mezun360.outbox.application;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.outbox.domain.OutboxEvent;
import tr.edu.btu.mezun360.outbox.infrastructure.OutboxEventRepository;

import java.util.List;

@Service
public class OutboxEventProcessor {
    private static final Logger log = LoggerFactory.getLogger(OutboxEventProcessor.class);

    private final OutboxEventRepository repository;
    private final OutboxEventHandler handler;

    public OutboxEventProcessor(OutboxEventRepository repository, OutboxEventHandler handler) {
        this.repository = repository;
        this.handler = handler;
    }

    @Scheduled(fixedDelayString = "${mezun360.outbox.fixed-delay:5000}")
    @Transactional
    public void processPendingEvents() {
        List<OutboxEvent> pendingEvents = repository.findPendingEventsForProcessing(50);
        
        for (OutboxEvent event : pendingEvents) {
            try {
                handler.handle(event);
                event.markAsProcessed();
                log.debug("Successfully processed outbox event: {}", event.getId());
            } catch (Exception ex) {
                log.error("Failed to process outbox event: {}", event.getId(), ex);
                event.incrementRetryCount();
                if (event.getRetryCount() >= 3) {
                    event.markAsFailed(ex.getMessage());
                }
            }
        }
    }
}

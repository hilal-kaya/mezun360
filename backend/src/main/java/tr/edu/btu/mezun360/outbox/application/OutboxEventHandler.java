package tr.edu.btu.mezun360.outbox.application;

import tr.edu.btu.mezun360.outbox.domain.OutboxEvent;

public interface OutboxEventHandler {
    void handle(OutboxEvent event);
}

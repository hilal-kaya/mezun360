package tr.edu.btu.mezun360.outbox;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.containers.PostgreSQLContainer;
import tr.edu.btu.mezun360.outbox.application.OutboxEventHandler;
import tr.edu.btu.mezun360.outbox.application.OutboxEventProcessor;
import tr.edu.btu.mezun360.outbox.domain.OutboxEvent;
import tr.edu.btu.mezun360.outbox.domain.OutboxEventStatus;
import tr.edu.btu.mezun360.outbox.infrastructure.OutboxEventRepository;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class OutboxEventProcessorTest {

    @Container static final PostgreSQLContainer<?> DB = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void db(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", DB::getJdbcUrl);
        r.add("spring.datasource.username", DB::getUsername);
        r.add("spring.datasource.password", DB::getPassword);
    }

    @Autowired
    OutboxEventRepository repository;

    @MockBean
    OutboxEventHandler mockHandler;

    @Autowired
    OutboxEventProcessor processor;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void processPendingEvents_MarksAsProcessed_WhenSuccessful() {
        OutboxEvent event = new OutboxEvent(UUID.randomUUID(), "Test.v1", UUID.randomUUID(), Instant.now(), UUID.randomUUID(), "{}");
        repository.save(event);

        processor.processPendingEvents();

        OutboxEvent processed = repository.findById(event.getId()).orElseThrow();
        assertThat(processed.getStatus()).isEqualTo(OutboxEventStatus.PROCESSED);
        verify(mockHandler, times(1)).handle(any());
    }

    @Test
    void processPendingEvents_IncrementsRetryCount_WhenHandlerFails() {
        OutboxEvent event = new OutboxEvent(UUID.randomUUID(), "Test.v1", UUID.randomUUID(), Instant.now(), UUID.randomUUID(), "{}");
        repository.save(event);

        doThrow(new RuntimeException("Simulated Failure")).when(mockHandler).handle(any());

        processor.processPendingEvents();

        OutboxEvent afterFirstTry = repository.findById(event.getId()).orElseThrow();
        assertThat(afterFirstTry.getStatus()).isEqualTo(OutboxEventStatus.PENDING);
        assertThat(afterFirstTry.getRetryCount()).isEqualTo(1);

        processor.processPendingEvents();
        processor.processPendingEvents();

        OutboxEvent afterThirdTry = repository.findById(event.getId()).orElseThrow();
        assertThat(afterThirdTry.getStatus()).isEqualTo(OutboxEventStatus.FAILED);
        assertThat(afterThirdTry.getRetryCount()).isEqualTo(3);
        assertThat(afterThirdTry.getErrorMessage()).contains("Simulated Failure");
    }
}

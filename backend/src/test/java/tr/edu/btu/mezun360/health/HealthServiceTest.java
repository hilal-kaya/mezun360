package tr.edu.btu.mezun360.health;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import tr.edu.btu.mezun360.shared.exception.ServiceUnavailableException;

@ExtendWith(MockitoExtension.class)
class HealthServiceTest {
    @Mock JdbcTemplate jdbc;

    @Test
    void unavailableDatabaseDoesNotExposeConnectionDetails() {
        when(jdbc.queryForObject("SELECT 1", Integer.class))
                .thenThrow(new DataAccessResourceFailureException("sensitive-connection-details"));
        assertThatThrownBy(() -> new HealthService(jdbc).checkReadiness())
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageNotContaining("sensitive-connection-details")
                .hasNoCause();
    }
}

package tr.edu.btu.mezun360.health;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import tr.edu.btu.mezun360.shared.exception.ServiceUnavailableException;

@Service
public class HealthService {
    private final JdbcTemplate jdbc;

    public HealthService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public HealthResponse checkReadiness() {
        try {
            Integer result = jdbc.queryForObject("SELECT 1", Integer.class);
            if (!Integer.valueOf(1).equals(result)) throw new ServiceUnavailableException();
            return new HealthResponse("UP", "mezun360-api");
        } catch (DataAccessException ex) {
            throw new ServiceUnavailableException();
        }
    }
}

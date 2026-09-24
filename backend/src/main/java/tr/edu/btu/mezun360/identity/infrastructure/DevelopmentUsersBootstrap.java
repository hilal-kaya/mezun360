package tr.edu.btu.mezun360.identity.infrastructure;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tr.edu.btu.mezun360.config.SecurityProperties;
import tr.edu.btu.mezun360.identity.application.DevelopmentAccountService;
import tr.edu.btu.mezun360.identity.domain.Role;

@Component
@ConditionalOnProperty(prefix = "mezun360.security", name = "dev-users-enabled", havingValue = "true")
public class DevelopmentUsersBootstrap implements ApplicationRunner {
    private final SecurityProperties properties;
    private final DevelopmentAccountService accounts;
    public DevelopmentUsersBootstrap(SecurityProperties properties, DevelopmentAccountService accounts) {
        this.properties = properties; this.accounts = accounts;
    }
    @Override public void run(ApplicationArguments args) {
        accounts.create(properties.getDevAlumniEmail(), properties.getDevAlumniPassword(), Role.ALUMNI);
        accounts.create(properties.getDevAdminEmail(), properties.getDevAdminPassword(), Role.ADMIN);
    }
}

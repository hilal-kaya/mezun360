package tr.edu.btu.mezun360.identity.application;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tr.edu.btu.mezun360.identity.infrastructure.UserAccountRepository;

@Service
public class AccountIdentityService {
    private final UserAccountRepository accounts;
    public AccountIdentityService(UserAccountRepository accounts) { this.accounts = accounts; }

    @Transactional(readOnly = true)
    public Optional<AccountIdentity> find(UUID id) {
        return accounts.findById(id).map(a -> new AccountIdentity(a.id(), a.email(), a.role(), a.status(),
                a.securityVersion(), a.canAuthenticate(), a.developmentOnly()));
    }
}

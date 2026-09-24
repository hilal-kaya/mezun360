package tr.edu.btu.mezun360.identity.application;

import org.springframework.stereotype.Component;

/** Fail-closed boundary. A reviewed TOTP enrollment/verification adapter is future work. */
@Component
public class AdminMfaBoundary {
    public boolean productionReady() { return false; }
}

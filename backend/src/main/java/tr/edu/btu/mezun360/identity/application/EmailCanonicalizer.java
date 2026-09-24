package tr.edu.btu.mezun360.identity.application;

import java.util.Locale;

public final class EmailCanonicalizer {
    private EmailCanonicalizer() {}
    public static String canonicalize(String email) { return email.strip().toLowerCase(Locale.ROOT); }
}

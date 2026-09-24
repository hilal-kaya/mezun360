package tr.edu.btu.mezun360.config;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("mezun360.security")
public class SecurityProperties {
    private boolean cookieSecure = true;
    private String cookieName = "__Host-mezun360-session";
    private String sameSite = "Lax";
    private boolean adminMfaRequired = true;
    private List<String> allowedOrigins = List.of();
    private Duration alumniIdle = Duration.ofMinutes(30);
    private Duration alumniAbsolute = Duration.ofHours(8);
    private Duration adminIdle = Duration.ofMinutes(15);
    private Duration adminAbsolute = Duration.ofHours(4);
    private Duration rateWindow = Duration.ofMinutes(5);
    private int accountAttempts = 5;
    private int sourceAttempts = 30;
    private boolean devUsersEnabled;
    private String devAlumniEmail = "";
    private String devAlumniPassword = "";
    private String devAdminEmail = "";
    private String devAdminPassword = "";

    public boolean isCookieSecure() { return cookieSecure; }
    public void setCookieSecure(boolean value) { cookieSecure = value; }
    public String getCookieName() { return cookieName; }
    public void setCookieName(String value) { cookieName = value; }
    public String getSameSite() { return sameSite; }
    public void setSameSite(String value) { sameSite = value; }
    public boolean isAdminMfaRequired() { return adminMfaRequired; }
    public void setAdminMfaRequired(boolean value) { adminMfaRequired = value; }
    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> value) { allowedOrigins = List.copyOf(value); }
    public Duration getAlumniIdle() { return alumniIdle; }
    public void setAlumniIdle(Duration value) { alumniIdle = value; }
    public Duration getAlumniAbsolute() { return alumniAbsolute; }
    public void setAlumniAbsolute(Duration value) { alumniAbsolute = value; }
    public Duration getAdminIdle() { return adminIdle; }
    public void setAdminIdle(Duration value) { adminIdle = value; }
    public Duration getAdminAbsolute() { return adminAbsolute; }
    public void setAdminAbsolute(Duration value) { adminAbsolute = value; }
    public Duration getRateWindow() { return rateWindow; }
    public void setRateWindow(Duration value) { rateWindow = value; }
    public int getAccountAttempts() { return accountAttempts; }
    public void setAccountAttempts(int value) { accountAttempts = value; }
    public int getSourceAttempts() { return sourceAttempts; }
    public void setSourceAttempts(int value) { sourceAttempts = value; }
    public boolean isDevUsersEnabled() { return devUsersEnabled; }
    public void setDevUsersEnabled(boolean value) { devUsersEnabled = value; }
    public String getDevAlumniEmail() { return devAlumniEmail; }
    public void setDevAlumniEmail(String value) { devAlumniEmail = value; }
    public String getDevAlumniPassword() { return devAlumniPassword; }
    public void setDevAlumniPassword(String value) { devAlumniPassword = value; }
    public String getDevAdminEmail() { return devAdminEmail; }
    public void setDevAdminEmail(String value) { devAdminEmail = value; }
    public String getDevAdminPassword() { return devAdminPassword; }
    public void setDevAdminPassword(String value) { devAdminPassword = value; }
}

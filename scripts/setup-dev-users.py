"""Create local-only random demo credentials in the ignored root .env; never print secrets."""
from pathlib import Path
import secrets

root = Path(__file__).resolve().parents[1]
path = root / ".env"
text = path.read_text() if path.exists() else (root / ".env.example").read_text()
values = dict(line.split("=", 1) for line in text.splitlines() if "=" in line and not line.startswith("#"))
if values.get("SPRING_PROFILES_ACTIVE") != "local":
    raise SystemExit("Select only SPRING_PROFILES_ACTIVE=local in .env before local user setup.")
if values.get("DEV_USERS_ENABLED", "true") != "true":
    raise SystemExit("Set DEV_USERS_ENABLED=true in .env to explicitly enable local demo accounts.")
additions = {
    "DEV_USERS_ENABLED": "true",
    "DEV_ALUMNI_EMAIL": "alumni@example.test",
    "DEV_ALUMNI_PASSWORD": secrets.token_urlsafe(24),
    "DEV_ADMIN_EMAIL": "admin@example.test",
    "DEV_ADMIN_PASSWORD": secrets.token_urlsafe(24),
}
for key, value in additions.items():
    if key in values and not values[key]:
        text = text.replace(f"{key}=\n", f"{key}={value}\n")
    elif key not in values:
        text = text.rstrip() + f"\n{key}={value}\n"
path.write_text(text)
path.chmod(0o600)
print("Local demo settings prepared in .env. Read credentials there; restart the backend to create missing accounts.")
print("Existing credentials and accounts are preserved. No password is printed or committed.")

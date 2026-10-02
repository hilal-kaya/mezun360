TOKEN_JSON=$(curl -s -c cookie.txt http://localhost/api/v1/auth/csrf)
TOKEN=$(echo $TOKEN_JSON | grep -o '"token":"[^"]*' | cut -d'"' -f4)
curl -s -i http://localhost/api/v1/auth/login \
  -b cookie.txt \
  -H "X-CSRF-TOKEN: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.test", "password": "admin"}'

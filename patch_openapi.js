const fs = require('fs');
const file = 'contracts/openapi/mezun360.yaml';
const doc = JSON.parse(fs.readFileSync(file, 'utf8'));

const commonErrors = {
  "401": {
    "description": "Authentication required or invalid credentials.",
    "content": {
      "application/problem+json": {
        "schema": { "$ref": "#/components/schemas/ApiProblem" }
      }
    }
  },
  "403": {
    "description": "CSRF token invalid, CORS rejected or access forbidden.",
    "content": {
      "application/problem+json": {
        "schema": { "$ref": "#/components/schemas/ApiProblem" }
      }
    }
  },
  "500": {
    "description": "Unexpected error; sanitized detail.",
    "content": {
      "application/problem+json": {
        "schema": { "$ref": "#/components/schemas/ApiProblem" }
      }
    }
  },
  "503": {
    "description": "Required dependency unavailable.",
    "content": {
      "application/problem+json": {
        "schema": { "$ref": "#/components/schemas/ApiProblem" }
      }
    }
  }
};

doc.paths['/api/v1/mentorship/requests'].post.responses = {
  ...doc.paths['/api/v1/mentorship/requests'].post.responses,
  ...commonErrors
};
doc.paths['/api/v1/mentorship/requests/incoming'].get.responses = {
  ...doc.paths['/api/v1/mentorship/requests/incoming'].get.responses,
  ...commonErrors
};
doc.paths['/api/v1/mentorship/requests/outgoing'].get.responses = {
  ...doc.paths['/api/v1/mentorship/requests/outgoing'].get.responses,
  ...commonErrors
};
doc.paths['/api/v1/mentorship/requests/{id}/status'].patch.responses = {
  ...doc.paths['/api/v1/mentorship/requests/{id}/status'].patch.responses,
  ...commonErrors
};

fs.writeFileSync(file, JSON.stringify(doc, null, 2));

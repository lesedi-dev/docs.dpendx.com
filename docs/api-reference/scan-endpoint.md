---
sidebar_position: 4
---

# Scan Endpoint

Trigger vulnerability scans programmatically without a GitHub webhook.

## Endpoint

```
POST /api/scan
```

:::note Database Required
This endpoint requires a database to be configured. See [Database Setup](/self-hosting/database-setup).
:::

## Request

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |

### Body

```json
{
  "installation_id": 12345678,
  "owner": "myorg",
  "repo": "myrepo",
  "ref": "main",
  "sha": "abc123def456..."
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `installation_id` | integer | Yes | GitHub App installation ID |
| `owner` | string | Yes | Repository owner (user or org) |
| `repo` | string | Yes | Repository name |
| `ref` | string | Yes | Branch name or tag |
| `sha` | string | No | Specific commit SHA (defaults to HEAD of ref) |

## Response

### Success (Scan Started)

```json
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "status": "accepted",
  "scan_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Scan started"
}
```

### Success (Scan Complete)

If the scan completes quickly:

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "success",
  "scan_id": "550e8400-e29b-41d4-a716-446655440000",
  "result": {
    "conclusion": "failure",
    "vulnerability_count": 3,
    "imported_count": 2,
    "total_deps": 47,
    "ecosystems": ["npm", "Go"],
    "duration_ms": 2341,
    "findings": [
      {
        "package": "lodash",
        "version": "4.17.20",
        "ecosystem": "npm",
        "vulnerability_id": "GHSA-35jh-r3h4-6jhm",
        "severity": "HIGH",
        "is_imported": true,
        "fixed_version": "4.17.21"
      }
    ]
  }
}
```

### Error Responses

**Invalid Installation**

```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "invalid_installation",
    "message": "GitHub App is not installed on this repository"
  }
}
```

**Repository Not Found**

```json
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "repo_not_found",
    "message": "Repository not found or not accessible"
  }
}
```

**Missing Fields**

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "invalid_request",
    "message": "Missing required field: owner"
  }
}
```

## Examples

### curl

```bash
curl -X POST https://your-dpendx.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "installation_id": 12345678,
    "owner": "myorg",
    "repo": "myrepo",
    "ref": "main"
  }'
```

### JavaScript

```javascript
const response = await fetch('https://your-dpendx.com/api/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    installation_id: 12345678,
    owner: 'myorg',
    repo: 'myrepo',
    ref: 'main',
  }),
});

const result = await response.json();
console.log(result);
```

### Go

```go
payload := map[string]interface{}{
    "installation_id": 12345678,
    "owner":           "myorg",
    "repo":            "myrepo",
    "ref":             "main",
}

body, _ := json.Marshal(payload)
resp, err := http.Post(
    "https://your-dpendx.com/api/scan",
    "application/json",
    bytes.NewReader(body),
)
```

### Python

```python
import requests

response = requests.post(
    'https://your-dpendx.com/api/scan',
    json={
        'installation_id': 12345678,
        'owner': 'myorg',
        'repo': 'myrepo',
        'ref': 'main',
    }
)

result = response.json()
print(result)
```

## Finding Your Installation ID

The installation ID is available in:

1. **GitHub App settings** → Installations → Click on installation
2. **Webhook payloads** → `installation.id` field
3. **GitHub API**:
   ```bash
   gh api /users/{owner}/installation
   ```

## Use Cases

### CI/CD Integration

Scan before deployment:

```yaml
# GitHub Actions
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger dpendx scan
        run: |
          RESULT=$(curl -s -X POST https://your-dpendx.com/api/scan \
            -H "Content-Type: application/json" \
            -d '{
              "installation_id": ${{ secrets.DPENDX_INSTALLATION_ID }},
              "owner": "${{ github.repository_owner }}",
              "repo": "${{ github.event.repository.name }}",
              "ref": "${{ github.ref_name }}",
              "sha": "${{ github.sha }}"
            }')

          CONCLUSION=$(echo $RESULT | jq -r '.result.conclusion // empty')
          if [ "$CONCLUSION" = "failure" ]; then
            echo "Vulnerabilities found!"
            exit 1
          fi
```

### Scheduled Scans

Scan nightly:

```bash
#!/bin/bash
# nightly-scan.sh

REPOS=("myorg/repo1" "myorg/repo2" "myorg/repo3")

for REPO in "${REPOS[@]}"; do
  OWNER=$(echo $REPO | cut -d'/' -f1)
  NAME=$(echo $REPO | cut -d'/' -f2)

  curl -X POST https://your-dpendx.com/api/scan \
    -H "Content-Type: application/json" \
    -d "{
      \"installation_id\": 12345678,
      \"owner\": \"$OWNER\",
      \"repo\": \"$NAME\",
      \"ref\": \"main\"
    }"
done
```

### Bulk Scanning

Scan all repositories:

```python
import requests

installation_id = 12345678
repos = ['repo1', 'repo2', 'repo3']

for repo in repos:
    response = requests.post(
        'https://your-dpendx.com/api/scan',
        json={
            'installation_id': installation_id,
            'owner': 'myorg',
            'repo': repo,
            'ref': 'main',
        }
    )
    print(f"{repo}: {response.json()}")
```

## Rate Limits

| Limit | Value |
|-------|-------|
| Requests per hour | 60 per installation |
| Concurrent scans | 5 per installation |

## Next Steps

- [Fix endpoint](/api-reference/fix-endpoint)
- [Data models](/api-reference/data-models)
- [Webhook reference](/api-reference/webhooks)

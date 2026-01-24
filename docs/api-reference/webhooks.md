---
sidebar_position: 2
---

# Webhooks

dpendx receives GitHub events via webhooks to trigger vulnerability scans.

## Endpoint

```
POST /webhook
```

## Headers

| Header | Description | Required |
|--------|-------------|----------|
| `X-GitHub-Event` | Event type (e.g., `pull_request`) | Yes |
| `X-GitHub-Delivery` | Unique delivery ID | Yes |
| `X-Hub-Signature-256` | HMAC-SHA256 signature | Yes |
| `Content-Type` | Must be `application/json` | Yes |

## Signature Validation

dpendx validates every webhook using HMAC-SHA256:

```
X-Hub-Signature-256: sha256=<hex-digest>
```

The signature is computed as:
```
HMAC-SHA256(webhook_secret, request_body)
```

### Validation Example (Go)

```go
func validateSignature(body []byte, signature, secret string) bool {
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write(body)
    expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(signature), []byte(expected))
}
```

## Supported Events

### pull_request

Triggers a vulnerability scan when a PR is opened, updated, or reopened.

**Actions handled:**
- `opened` - New PR created
- `synchronize` - PR updated with new commits
- `reopened` - Closed PR reopened

**Payload fields used:**

```json
{
  "action": "opened",
  "number": 42,
  "pull_request": {
    "head": {
      "sha": "abc123...",
      "ref": "feature-branch"
    }
  },
  "repository": {
    "owner": {
      "login": "myorg"
    },
    "name": "myrepo"
  },
  "installation": {
    "id": 12345678
  }
}
```

### check_run

Handles action button clicks in check run results.

**Actions handled:**
- `requested_action` - User clicked an action button

**Payload fields used:**

```json
{
  "action": "requested_action",
  "requested_action": {
    "identifier": "fix:abc123"
  },
  "check_run": {
    "id": 123456,
    "head_sha": "abc123..."
  },
  "repository": {
    "owner": {
      "login": "myorg"
    },
    "name": "myrepo"
  },
  "installation": {
    "id": 12345678
  }
}
```

## Response

### Success

```
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "status": "accepted",
  "message": "Webhook received, processing asynchronously"
}
```

dpendx immediately returns 202 and processes the scan asynchronously.

### Invalid Signature

```
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "status": "error",
  "error": {
    "code": "invalid_signature",
    "message": "Webhook signature validation failed"
  }
}
```

### Unsupported Event

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ignored",
  "message": "Event type not handled"
}
```

Events that dpendx doesn't handle receive a 200 response (not an error).

## Processing Flow

```
┌──────────────────────────────────────────────────────────┐
│  POST /webhook                                            │
│                                                          │
│  1. Validate X-Hub-Signature-256                         │
│  2. Parse event type from X-GitHub-Event                 │
│  3. If pull_request with handled action:                 │
│     - Spawn goroutine for async processing               │
│     - Return 202 Accepted immediately                    │
│  4. Goroutine:                                           │
│     - Create check run (in_progress)                     │
│     - Fetch files, parse deps, query OSV                 │
│     - Run reachability analysis                          │
│     - Update check run with results                      │
└──────────────────────────────────────────────────────────┘
```

## Retry Behavior

GitHub retries failed webhook deliveries:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 10 seconds |
| 3 | 60 seconds |
| 4+ | Up to 5 hours between retries |

After 3 days without success, the webhook is marked as failed.

dpendx returns 202 quickly to avoid triggering retries unnecessarily.

## Idempotency

dpendx handles duplicate webhooks safely:

- Same PR + SHA = No duplicate check runs created
- Processing checks for existing in-progress runs
- Database constraints prevent duplicate scan records

## Debugging Webhooks

### GitHub Delivery Log

View webhook deliveries in your GitHub App settings:

1. Go to app settings
2. Click **Advanced** tab
3. View **Recent Deliveries**

Each delivery shows:
- Request headers and body
- Response code and body
- Timing information

### Redeliver

To manually redeliver a webhook:

1. Find the delivery in Recent Deliveries
2. Click **Redeliver**
3. Confirm

### Local Development

Use [smee.io](https://smee.io/) to forward webhooks locally:

```bash
# Install smee client
npm install -g smee-client

# Start forwarding
smee -u https://smee.io/your-channel -t http://localhost:8080/webhook
```

Configure your GitHub App's webhook URL to the smee.io URL.

## Security Considerations

1. **Always validate signatures** - Never process unsigned webhooks
2. **Use HTTPS** - GitHub only sends webhooks over HTTPS
3. **Rotate secrets** - Periodically rotate your webhook secret
4. **IP allowlisting** - Optionally restrict to [GitHub's IP ranges](https://api.github.com/meta)

## Testing

### Mock Webhook

```bash
curl -X POST http://localhost:8080/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -H "X-GitHub-Delivery: test-123" \
  -H "X-Hub-Signature-256: sha256=$(echo -n '{"action":"opened"}' | openssl dgst -sha256 -hmac 'your-secret' | cut -d' ' -f2)" \
  -d '{"action":"opened","number":1,"pull_request":{"head":{"sha":"abc"}},"repository":{"owner":{"login":"test"},"name":"repo"},"installation":{"id":123}}'
```

## Next Steps

- [Health endpoint](/api-reference/health-endpoint)
- [Scan endpoint](/api-reference/scan-endpoint)
- [Troubleshoot webhook issues](/troubleshooting/webhook-issues)

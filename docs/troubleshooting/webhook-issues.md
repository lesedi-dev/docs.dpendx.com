---
sidebar_position: 3
---

# Webhook Issues

Troubleshoot problems with GitHub webhook delivery and processing.

## Webhook Not Delivered

### Symptom

GitHub shows webhooks as not delivered or pending.

### Check Webhook Configuration

1. Go to your GitHub App settings
2. Click **Advanced** → **Recent Deliveries**
3. Look for failed deliveries

### Common Causes

1. **Webhook URL unreachable**
   - URL is incorrect
   - Server is down
   - Firewall blocking requests

2. **DNS issues**
   - Domain not resolving
   - DNS propagation not complete

3. **SSL certificate problems**
   - Invalid or expired certificate
   - Self-signed certificate not trusted

### Solutions

```bash
# Test URL reachability
curl -I https://your-dpendx-instance.com/webhook

# Check DNS
nslookup your-dpendx-instance.com

# Check SSL
openssl s_client -connect your-dpendx-instance.com:443
```

## Signature Validation Failures

### Symptom

Webhooks return 401 Unauthorized with "Invalid signature" message.

### Causes

1. **Secret mismatch**
   - GitHub App secret differs from `GITHUB_WEBHOOK_SECRET`

2. **Secret encoding issues**
   - Extra whitespace or newlines
   - Incorrect character encoding

3. **Request body modification**
   - Proxy modifying the body
   - Compression issues

### Solutions

1. **Verify secrets match**
   ```bash
   # GitHub App settings → Webhook → Secret
   # Must exactly match GITHUB_WEBHOOK_SECRET
   ```

2. **Regenerate secret**
   - Generate new secret: `openssl rand -hex 32`
   - Update both GitHub App and dpendx config
   - Redeploy dpendx

3. **Check for proxies**
   - Ensure proxy passes body unmodified
   - Disable compression if enabled

### Testing Signature

```bash
# Generate test signature
SECRET="your-webhook-secret"
BODY='{"action":"opened"}'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)
echo "sha256=$SIGNATURE"
```

## Event Not Processed

### Symptom

Webhook is delivered (200/202 response) but nothing happens.

### Causes

1. **Event type not subscribed**
   - `pull_request` event not enabled
   - `check_run` event not enabled

2. **Action not handled**
   - Only `opened`, `synchronize`, `reopened` are handled for PRs

3. **Repository not installed**
   - App not installed on the repository

### Solutions

1. **Check subscribed events**
   - GitHub App settings → Permissions & events
   - Enable `Pull request` and `Check run`

2. **Check installation**
   - Settings → Applications → dpendx → Configure
   - Verify repository is selected

3. **Check logs**
   ```bash
   docker logs dpendx | grep "event received"
   ```

## Slow Webhook Response

### Symptom

Webhook delivery shows long response time (>30 seconds).

### Causes

1. **Synchronous processing**
   - dpendx should return 202 immediately
   - Processing happens asynchronously

2. **Server overload**
   - Too many concurrent webhooks
   - Insufficient resources

### Solutions

1. **Verify async processing**
   - Response should be immediate (< 1 second)
   - Actual scan happens in background

2. **Scale resources**
   - Increase CPU/memory
   - Add more replicas

## Duplicate Webhooks

### Symptom

Multiple check runs or scans for the same PR.

### Causes

1. **GitHub retries**
   - Previous delivery timed out
   - GitHub retries the webhook

2. **Multiple app installations**
   - App installed multiple times

### Solutions

1. **Improve response time**
   - Return 202 faster
   - Avoid timeouts triggering retries

2. **Idempotency**
   - dpendx handles duplicates
   - Same PR/SHA won't create duplicate runs

## Webhook URL Best Practices

### Use HTTPS

```
✅ https://dpendx.example.com/webhook
❌ http://dpendx.example.com/webhook
```

### Use Valid Certificates

- Let's Encrypt for free certificates
- Ensure certificate covers exact domain
- Auto-renewal to prevent expiry

### Stable URLs

```
✅ https://dpendx.example.com/webhook (custom domain)
❌ https://random-id.ngrok.io/webhook (temporary)
```

## Debugging Webhooks

### View Delivery Details

1. Go to GitHub App settings
2. Click **Advanced**
3. Click **Recent Deliveries**
4. Click on a delivery to see:
   - Request headers
   - Request body
   - Response code
   - Response body

### Redeliver Webhook

1. Find the delivery in Recent Deliveries
2. Click **Redeliver**
3. Watch for response

### Local Development

Use [smee.io](https://smee.io) for local webhook testing:

```bash
# Install smee client
npm install -g smee-client

# Create a channel at smee.io
# Then run:
smee -u https://smee.io/YOUR-CHANNEL -t http://localhost:8080/webhook
```

Configure your GitHub App to use the smee.io URL temporarily.

## Webhook Payload Examples

### Pull Request Opened

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
    "owner": { "login": "myorg" },
    "name": "myrepo"
  },
  "installation": { "id": 12345678 }
}
```

### Check Run Requested Action

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
    "owner": { "login": "myorg" },
    "name": "myrepo"
  },
  "installation": { "id": 12345678 }
}
```

## GitHub IP Allowlisting

If you use IP allowlisting, add GitHub's webhook IPs:

```bash
# Get GitHub's webhook IP ranges
curl https://api.github.com/meta | jq '.hooks'
```

## Next Steps

- [Parser issues](/troubleshooting/parser-issues)
- [Common issues](/troubleshooting/common-issues)
- [FAQ](/troubleshooting/faq)

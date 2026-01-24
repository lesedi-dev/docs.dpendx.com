---
sidebar_position: 1
---

# API Reference Overview

dpendx exposes several HTTP endpoints for health checks, webhooks, and programmatic scanning.

## Base URL

| Environment | Base URL |
|-------------|----------|
| Cloud | `https://api.dpendx.com` |
| Self-hosted | Your deployment URL |

## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Health check | No |
| `POST` | `/webhook` | GitHub webhook handler | Webhook signature |
| `POST` | `/api/scan` | Trigger manual scan | API key |
| `POST` | `/api/fix` | Create fix PR | API key |

## Authentication

### Webhook Signature (GitHub)

GitHub webhooks are authenticated using HMAC-SHA256 signatures. The signature is sent in the `X-Hub-Signature-256` header.

```
X-Hub-Signature-256: sha256=abc123...
```

### API Key (Manual endpoints)

For `/api/scan` and `/api/fix` endpoints, authentication is done via installation ID in the request body. The GitHub App's installation provides the authorization context.

## Response Format

All endpoints return JSON responses:

### Success Response

```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "invalid_request",
    "message": "Missing required field: repo"
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `202` | Accepted (async processing) |
| `400` | Bad Request |
| `401` | Unauthorized |
| `404` | Not Found |
| `422` | Unprocessable Entity |
| `500` | Internal Server Error |

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/health` | Unlimited |
| `/webhook` | By GitHub's rate |
| `/api/scan` | 60 requests/hour per installation |
| `/api/fix` | 10 requests/hour per installation |

## Timeouts

| Operation | Timeout |
|-----------|---------|
| Scan processing | 5 minutes |
| GitHub API calls | 30 seconds |
| OSV queries | 10 seconds (per query) |

## CORS

CORS is not enabled by default. For browser-based applications accessing the API, configure a reverse proxy or contact support for cloud deployments.

## Versioning

The API currently has no version prefix. Breaking changes will be announced in release notes.

Future versions may use:
```
/v2/api/scan
```

## SDK Support

Currently, dpendx is designed to be called via:
1. GitHub webhooks (automatic)
2. Direct HTTP requests

No official SDKs are available yet.

## Endpoints

- [**Webhooks**](/api-reference/webhooks) - GitHub webhook handling
- [**Health Endpoint**](/api-reference/health-endpoint) - Health checks
- [**Scan Endpoint**](/api-reference/scan-endpoint) - Trigger scans programmatically
- [**Fix Endpoint**](/api-reference/fix-endpoint) - Create fix PRs
- [**Data Models**](/api-reference/data-models) - Request/response schemas

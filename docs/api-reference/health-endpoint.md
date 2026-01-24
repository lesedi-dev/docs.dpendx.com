---
sidebar_position: 3
---

# Health Endpoint

Check dpendx service health and status.

## Endpoint

```
GET /health
```

## Authentication

None required. This endpoint is public.

## Response

### Success Response

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "healthy",
  "version": "1.0.0",
  "cache_size": 42,
  "uptime_seconds": 86400
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"healthy"` when responding |
| `version` | string | dpendx version (semver) |
| `cache_size` | integer | Number of cached OSV responses |
| `uptime_seconds` | integer | Seconds since server started |

## Example Request

### curl

```bash
curl https://your-dpendx-instance.com/health
```

### JavaScript

```javascript
const response = await fetch('https://your-dpendx-instance.com/health');
const health = await response.json();
console.log(health.status); // "healthy"
```

### Go

```go
resp, err := http.Get("https://your-dpendx-instance.com/health")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()

var health struct {
    Status        string `json:"status"`
    Version       string `json:"version"`
    CacheSize     int    `json:"cache_size"`
    UptimeSeconds int    `json:"uptime_seconds"`
}
json.NewDecoder(resp.Body).Decode(&health)
```

## Use Cases

### Kubernetes Liveness Probe

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30
```

### Kubernetes Readiness Probe

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q --spider http://localhost:8080/health || exit 1
```

### Load Balancer Health Check

Configure your load balancer to poll `/health`:

```nginx
upstream dpendx {
    server dpendx1:8080;
    server dpendx2:8080;
}

server {
    location /health {
        proxy_pass http://dpendx;
        proxy_connect_timeout 5s;
        proxy_read_timeout 5s;
    }
}
```

## Monitoring

### Uptime Monitoring

Use the health endpoint with monitoring services:

- **UptimeRobot**: Check every 5 minutes
- **Pingdom**: Monitor response time
- **Datadog**: Synthetic monitoring

### Alerting

Alert when:
- Response is not 200
- Response time > 1 second
- Version changes unexpectedly

### Prometheus (if metrics enabled)

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'dpendx'
    static_configs:
      - targets: ['dpendx:8080']
    metrics_path: /metrics
```

## Cache Size Interpretation

The `cache_size` field indicates cached OSV query results:

| Cache Size | Interpretation |
|------------|----------------|
| 0 | Fresh start, no cached queries |
| 1-100 | Light usage |
| 100-1000 | Moderate usage |
| 1000+ | Heavy usage, cache working well |

Cache entries expire after 4 hours.

## Version Format

The version follows semantic versioning:

```
MAJOR.MINOR.PATCH
```

Example: `1.2.3`

- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

## Error Scenarios

If the service is unhealthy, it won't respond to this endpoint (connection refused or timeout).

Possible failure modes:

| Scenario | Behavior |
|----------|----------|
| Service down | Connection refused |
| Service starting | Connection refused or timeout |
| Out of memory | Timeout or 500 |
| Panic/crash | Connection refused |

## Best Practices

1. **Poll regularly** - Every 30 seconds is reasonable
2. **Set timeouts** - 5-10 seconds max for health checks
3. **Monitor trends** - Track cache_size and uptime over time
4. **Alert on changes** - Unexpected version changes may indicate issues

## Next Steps

- [Webhooks endpoint](/api-reference/webhooks)
- [Scan endpoint](/api-reference/scan-endpoint)
- [Troubleshoot common issues](/troubleshooting/common-issues)

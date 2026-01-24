---
sidebar_position: 2
---

# Docker Deployment

Deploy dpendx using Docker on any cloud provider or on-premises infrastructure.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose (optional, for multi-container setup)
- [GitHub App created](/self-hosting/github-app-setup)

## Quick Start

### Pull the Image

```bash
docker pull ghcr.io/dpendx/dpendx:latest
```

### Run with Docker

```bash
docker run -d \
  --name dpendx \
  -p 8080:8080 \
  -e GITHUB_APP_ID=123456 \
  -e GITHUB_PRIVATE_KEY="$(cat private-key.pem | base64)" \
  -e GITHUB_WEBHOOK_SECRET=your_secret_here \
  ghcr.io/dpendx/dpendx:latest
```

### Verify

```bash
curl http://localhost:8080/health
```

## Docker Compose

For production deployments, use Docker Compose:

### docker-compose.yml

```yaml
version: '3.8'

services:
  dpendx:
    image: ghcr.io/dpendx/dpendx:latest
    container_name: dpendx
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - GITHUB_APP_ID=${GITHUB_APP_ID}
      - GITHUB_PRIVATE_KEY=${GITHUB_PRIVATE_KEY}
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
      - DATABASE_URL=${DATABASE_URL:-}
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
    networks:
      - dpendx-network

networks:
  dpendx-network:
    driver: bridge
```

### With PostgreSQL

```yaml
version: '3.8'

services:
  dpendx:
    image: ghcr.io/dpendx/dpendx:latest
    container_name: dpendx
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - GITHUB_APP_ID=${GITHUB_APP_ID}
      - GITHUB_PRIVATE_KEY=${GITHUB_PRIVATE_KEY}
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
      - DATABASE_URL=postgres://dpendx:dpendx_pass@postgres:5432/dpendx?sslmode=disable
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - dpendx-network

  postgres:
    image: postgres:15-alpine
    container_name: dpendx-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=dpendx
      - POSTGRES_PASSWORD=dpendx_pass
      - POSTGRES_DB=dpendx
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dpendx"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dpendx-network

volumes:
  postgres-data:

networks:
  dpendx-network:
    driver: bridge
```

### .env File

Create a `.env` file:

```bash
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=LS0tLS1CRUdJTi...
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

### Start Services

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f dpendx
```

## Building from Source

If you need to customize dpendx:

### Clone Repository

```bash
git clone https://github.com/dpendx/dpendx.git
cd dpendx
```

### Build Image

```bash
docker build -t dpendx:custom .
```

### Dockerfile

```dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o dpendx ./cmd/server

FROM alpine:3.18

RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=builder /app/dpendx .

EXPOSE 8080

CMD ["./dpendx"]
```

## Reverse Proxy Setup

### Nginx

```nginx
upstream dpendx {
    server localhost:8080;
}

server {
    listen 443 ssl http2;
    server_name dpendx.yourcompany.com;

    ssl_certificate /etc/ssl/certs/dpendx.crt;
    ssl_certificate_key /etc/ssl/private/dpendx.key;

    location / {
        proxy_pass http://dpendx;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Webhook timeout
        proxy_read_timeout 300s;
    }
}
```

### Traefik

```yaml
# docker-compose.yml with Traefik
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--providers.docker=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@yourcompany.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  dpendx:
    image: ghcr.io/dpendx/dpendx:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dpendx.rule=Host(`dpendx.yourcompany.com`)"
      - "traefik.http.routers.dpendx.entrypoints=websecure"
      - "traefik.http.routers.dpendx.tls.certresolver=letsencrypt"
    environment:
      - GITHUB_APP_ID=${GITHUB_APP_ID}
      - GITHUB_PRIVATE_KEY=${GITHUB_PRIVATE_KEY}
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}

volumes:
  letsencrypt:
```

## Resource Limits

Set appropriate resource limits:

```yaml
services:
  dpendx:
    image: ghcr.io/dpendx/dpendx:latest
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Monitoring

### Prometheus Metrics (if enabled)

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"
```

### Log Aggregation

Ship logs to your centralized logging:

```yaml
services:
  dpendx:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Or use a logging driver:
```yaml
    logging:
      driver: "fluentd"
      options:
        fluentd-address: "localhost:24224"
```

## Security Best Practices

### Run as Non-Root

```dockerfile
FROM alpine:3.18

RUN adduser -D -u 1000 dpendx
USER dpendx

COPY --from=builder --chown=dpendx:dpendx /app/dpendx .
```

### Read-Only Filesystem

```yaml
services:
  dpendx:
    read_only: true
    tmpfs:
      - /tmp
```

### Network Isolation

```yaml
services:
  dpendx:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true
```

## Updating

### Update Image

```bash
docker-compose pull
docker-compose up -d
```

### Rollback

```bash
docker-compose down
docker tag ghcr.io/dpendx/dpendx:latest ghcr.io/dpendx/dpendx:backup
docker pull ghcr.io/dpendx/dpendx:v1.0.0  # specific version
docker-compose up -d
```

## Troubleshooting

### Container Won't Start

```bash
docker logs dpendx
```

Common issues:
- Missing environment variables
- Invalid private key encoding
- Port already in use

### Health Check Failing

```bash
docker exec dpendx wget -q --spider http://localhost:8080/health
```

### Network Issues

```bash
# Test outbound connectivity
docker exec dpendx wget -q --spider https://api.github.com

# Check DNS
docker exec dpendx nslookup api.github.com
```

## Next Steps

- [Configure database](/self-hosting/database-setup)
- [View all environment variables](/self-hosting/environment-variables)
- [Deploy to Kubernetes](/self-hosting/deployment/kubernetes)

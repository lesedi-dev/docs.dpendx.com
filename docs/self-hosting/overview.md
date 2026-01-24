---
sidebar_position: 1
---

# Self-Hosting Overview

Run dpendx on your own infrastructure for full control over your vulnerability scanning.

## When to Self-Host

Self-hosting dpendx is ideal when you need:

| Requirement | Self-Hosted | Cloud |
|-------------|-------------|-------|
| Full data control | ✅ | ❌ |
| Private network access | ✅ | ❌ |
| Custom rate limits | ✅ | ❌ |
| On-premises deployment | ✅ | ❌ |
| Air-gapped environments | ✅ | ❌ |
| Custom branding | ✅ | ❌ |
| Zero configuration | ❌ | ✅ |
| Managed updates | ❌ | ✅ |

## Architecture

A self-hosted dpendx installation consists of:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Your Infrastructure                           │
│                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐ │
│  │   Load Balancer │────▶│    dpendx       │────▶│   PostgreSQL  │ │
│  │   (optional)    │     │    Server       │     │   (optional)  │ │
│  └─────────────────┘     └─────────────────┘     └───────────────┘ │
│          ▲                       │                                  │
│          │                       │                                  │
└──────────│───────────────────────│──────────────────────────────────┘
           │                       │
           │                       ▼
    ┌──────┴──────┐         ┌─────────────────┐
    │   GitHub    │         │   OSV Database  │
    │  Webhooks   │         │    (osv.dev)    │
    └─────────────┘         └─────────────────┘
```

### Components

| Component | Required | Purpose |
|-----------|----------|---------|
| dpendx server | ✅ Yes | Core application |
| GitHub App | ✅ Yes | Authentication and webhooks |
| PostgreSQL | ❌ Optional | Scan history persistence |
| Load balancer | ❌ Optional | High availability |

## Requirements

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 core | 2+ cores |
| Memory | 512 MB | 1 GB |
| Disk | 100 MB | 500 MB |
| Network | Public internet | Public internet |

### Network Requirements

dpendx needs outbound access to:

| Service | Endpoint | Port |
|---------|----------|------|
| GitHub API | api.github.com | 443 |
| OSV API | api.osv.dev | 443 |

And inbound access from:

| Service | Source | Port |
|---------|--------|------|
| GitHub Webhooks | hooks.github.com | Your configured port |

### GitHub Requirements

- GitHub App with required permissions
- Webhook secret for signature validation
- Private key for JWT authentication

## Deployment Options

### Quick Start Options

| Platform | Complexity | Cost | Best For |
|----------|------------|------|----------|
| [Railway](/self-hosting/deployment/railway) | Low | Free tier available | Quick deployment |
| [Docker](/self-hosting/deployment/docker) | Medium | Self-managed | Any cloud/on-prem |
| [Kubernetes](/self-hosting/deployment/kubernetes) | High | Self-managed | Enterprise scale |

### Platform Guides

1. **[Railway](/self-hosting/deployment/railway)** - One-click deployment with automatic SSL
2. **[Docker](/self-hosting/deployment/docker)** - Container-based deployment anywhere
3. **[Kubernetes](/self-hosting/deployment/kubernetes)** - Production-grade orchestration

## Getting Started

### Step 1: Create GitHub App

Follow the [GitHub App Setup Guide](/self-hosting/github-app-setup) to create your private GitHub App.

### Step 2: Choose Deployment Method

Select a deployment method based on your needs:

- **Railway** - Fastest setup, managed infrastructure
- **Docker** - Flexible, runs anywhere
- **Kubernetes** - Production-ready, scalable

### Step 3: Configure Environment

Set required environment variables:

```bash
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY=base64_encoded_pem
GITHUB_WEBHOOK_SECRET=your_secret
```

### Step 4: Deploy

Follow your chosen deployment guide.

### Step 5: Configure Webhook URL

Update your GitHub App's webhook URL to point to your deployment.

## Optional: Database Setup

For scan history and analytics, add PostgreSQL:

```bash
DATABASE_URL=postgres://user:pass@host:5432/dpendx
```

See [Database Setup](/self-hosting/database-setup) for details.

## Security Considerations

### Webhook Secret

Always use a strong, random webhook secret:

```bash
# Generate a secure secret
openssl rand -hex 32
```

### Private Key Protection

- Never commit the private key to version control
- Use environment variables or secret management
- Rotate keys periodically

### Network Security

- Use HTTPS with valid certificates
- Consider IP allowlisting for GitHub webhooks
- Run behind a firewall or VPN if needed

## Monitoring

### Health Check

dpendx exposes a health endpoint:

```bash
curl https://your-dpendx.com/health
```

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "cache_size": 42,
  "uptime_seconds": 86400
}
```

### Logging

dpendx uses structured JSON logging:

```json
{
  "time": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "msg": "scan completed",
  "repo": "org/repo",
  "pr": 123,
  "vulnerabilities": 2,
  "duration_ms": 1234
}
```

## Updates

### Checking for Updates

Watch the [GitHub releases](https://github.com/dpendx/dpendx/releases) for new versions.

### Upgrading

1. Pull the latest image or binary
2. Review the changelog for breaking changes
3. Update your deployment
4. Verify health check passes

## Support

For self-hosted deployments:

- [GitHub Issues](https://github.com/dpendx/dpendx/issues) - Bug reports
- [GitHub Discussions](https://github.com/dpendx/dpendx/discussions) - Questions
- Check logs for detailed error information

## Next Steps

1. [Create your GitHub App](/self-hosting/github-app-setup)
2. [Choose a deployment method](/self-hosting/deployment/railway)
3. [Configure environment variables](/self-hosting/environment-variables)

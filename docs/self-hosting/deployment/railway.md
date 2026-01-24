---
sidebar_position: 1
---

# Railway Deployment

Deploy dpendx to Railway with automatic SSL and scaling.

## Prerequisites

- [Railway account](https://railway.app)
- [GitHub App created](/self-hosting/github-app-setup)

## Quick Deploy

### Option 1: Deploy from Template

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/dpendx)

Click the button above to deploy dpendx with a pre-configured template.

### Option 2: Manual Deployment

1. Create a new project in Railway
2. Select **Deploy from GitHub repo**
3. Connect your fork of the dpendx repository
4. Railway will auto-detect the Dockerfile

## Configure Environment Variables

In your Railway project, add these environment variables:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `GITHUB_APP_ID` | Your app ID | From GitHub App settings |
| `GITHUB_PRIVATE_KEY` | Base64-encoded PEM | Your app's private key |
| `GITHUB_WEBHOOK_SECRET` | Your webhook secret | For signature validation |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port (Railway sets this automatically) |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `SCAN_BASE_URL` | - | Base URL for scan report links |

## Adding Environment Variables in Railway

1. Go to your project in Railway
2. Click on your service
3. Go to **Variables** tab
4. Click **New Variable** for each:

```
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=LS0tLS1CRUdJTi...
GITHUB_WEBHOOK_SECRET=your_secret_here
```

:::tip Multiline Values
Railway handles multiline values. Paste the full base64-encoded private key.
:::

## Configure Domain

### Using Railway's Domain

1. Go to **Settings** tab
2. Under **Networking**, click **Generate Domain**
3. You'll get a URL like: `dpendx-production-abc123.up.railway.app`

### Using Custom Domain

1. Go to **Settings** → **Networking**
2. Click **Custom Domain**
3. Enter your domain (e.g., `dpendx.yourcompany.com`)
4. Add the CNAME record to your DNS:
   ```
   dpendx.yourcompany.com → dpendx-production-abc123.up.railway.app
   ```

## Update GitHub App Webhook

After deployment, update your GitHub App:

1. Go to your GitHub App settings
2. Update **Webhook URL** to:
   ```
   https://your-railway-domain.up.railway.app/webhook
   ```
3. Save changes

## Verify Deployment

### Check Health Endpoint

```bash
curl https://your-railway-domain.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "cache_size": 0,
  "uptime_seconds": 60
}
```

### Check Webhook Connectivity

1. Open a test PR in an installed repository
2. Check that the dpendx check appears
3. Verify scan completes successfully

## Adding PostgreSQL (Optional)

For scan history persistence:

1. In Railway, click **New** → **Database** → **PostgreSQL**
2. Railway automatically injects `DATABASE_URL`
3. Redeploy your service

Or manually set:
```
DATABASE_URL=postgresql://postgres:password@host:5432/railway
```

## Scaling

### Vertical Scaling

Upgrade your Railway plan for more resources:

| Plan | Memory | vCPU |
|------|--------|------|
| Hobby | 512 MB | Shared |
| Pro | 8 GB | 8 vCPU |
| Enterprise | Custom | Custom |

### Horizontal Scaling

For high-availability, deploy multiple replicas:

1. Go to **Settings** → **Replicas**
2. Set replica count (requires Pro plan)

## Monitoring

### Railway Logs

View logs in real-time:

1. Click on your service
2. Go to **Logs** tab
3. Use the search and filter options

### Health Checks

Railway automatically monitors the `/health` endpoint.

## Cost Estimation

Railway pricing (as of 2024):

| Plan | Cost | Included |
|------|------|----------|
| Hobby | $5/mo | 500 hours, 100 GB egress |
| Pro | $20/mo | 2000 hours, 500 GB egress |

dpendx typically uses minimal resources. A Hobby plan handles most use cases.

## Troubleshooting

### Deployment Fails

Check the build logs:
1. Click on your service
2. Go to **Deployments** tab
3. Click on the failed deployment
4. Review build logs

Common issues:
- Missing environment variables
- Invalid Dockerfile
- Build timeout (increase in settings)

### Webhook Not Received

1. Verify webhook URL is correct
2. Check GitHub webhook delivery status
3. Review Railway logs for errors
4. Ensure Railway domain is accessible

### Memory Issues

If scans timeout or fail:
1. Upgrade to Pro plan
2. Increase memory limits
3. Check for memory leaks in logs

## Example railway.json

Create `railway.json` in your repo for custom configuration:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Next Steps

- [Configure database](/self-hosting/database-setup)
- [View all environment variables](/self-hosting/environment-variables)
- [Troubleshoot common issues](/troubleshooting/common-issues)

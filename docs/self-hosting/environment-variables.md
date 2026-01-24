---
sidebar_position: 5
---

# Environment Variables

Complete reference for all dpendx configuration options.

## Required Variables

These must be set for dpendx to function:

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_APP_ID` | Your GitHub App's ID | `123456` |
| `GITHUB_PRIVATE_KEY` | Base64-encoded PEM private key | `LS0tLS1CRUdJTi...` |
| `GITHUB_WEBHOOK_SECRET` | Webhook signature validation secret | `whsec_abc123...` |

### GITHUB_APP_ID

The numeric ID of your GitHub App, found in your app's settings page.

```bash
GITHUB_APP_ID=123456
```

### GITHUB_PRIVATE_KEY

The private key generated for your GitHub App, base64-encoded.

**Generate the encoded key:**
```bash
# macOS/Linux
base64 -i your-app.private-key.pem | tr -d '\n'

# Or with openssl
openssl base64 -in your-app.private-key.pem | tr -d '\n'
```

```bash
GITHUB_PRIVATE_KEY=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlF...
```

:::warning
The encoded key should be a single line with no newlines.
:::

### GITHUB_WEBHOOK_SECRET

The secret you configured when creating the GitHub App webhook.

```bash
GITHUB_WEBHOOK_SECRET=your_random_secret_here
```

**Generate a secure secret:**
```bash
openssl rand -hex 32
```

## Optional Variables

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP server port |

```bash
PORT=3000
```

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string |

```bash
DATABASE_URL=postgres://user:pass@host:5432/dpendx?sslmode=require
```

**Connection string components:**
- `postgres://` - Protocol
- `user:pass` - Credentials
- `host:5432` - Host and port
- `/dpendx` - Database name
- `?sslmode=require` - SSL mode (require, disable, verify-full)

### Scan Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SCAN_BASE_URL` | - | Base URL for scan report links |

```bash
SCAN_BASE_URL=https://dpendx.yourcompany.com
```

When set, dpendx includes links to scan reports in check run output.

## Complete Example

### Production Configuration

```bash
# Required
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlF...
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0...

# Server
PORT=8080

# Database (optional)
DATABASE_URL=postgres://dpendx:secure_pass@db.example.com:5432/dpendx?sslmode=require

# Scan reports (optional)
SCAN_BASE_URL=https://dpendx.yourcompany.com
```

### Development Configuration

```bash
# Required
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlF...
GITHUB_WEBHOOK_SECRET=dev_secret

# Server
PORT=8080

# Local database
DATABASE_URL=postgres://dpendx:dpendx@localhost:5432/dpendx?sslmode=disable
```

## Environment File

Create a `.env` file for local development:

```bash
# .env
GITHUB_APP_ID=123456
GITHUB_PRIVATE_KEY=LS0tLS1CRUdJTi...
GITHUB_WEBHOOK_SECRET=your_secret
PORT=8080
DATABASE_URL=postgres://dpendx:dpendx@localhost:5432/dpendx?sslmode=disable
```

:::danger
Never commit `.env` files to version control. Add `.env` to your `.gitignore`.
:::

## Platform-Specific Configuration

### Railway

Set variables in the Railway dashboard:
1. Go to your service
2. Click **Variables** tab
3. Add each variable

### Docker

Using `--env-file`:
```bash
docker run --env-file .env ghcr.io/dpendx/dpendx:latest
```

Using `-e` flags:
```bash
docker run \
  -e GITHUB_APP_ID=123456 \
  -e GITHUB_PRIVATE_KEY="$GITHUB_PRIVATE_KEY" \
  -e GITHUB_WEBHOOK_SECRET="$GITHUB_WEBHOOK_SECRET" \
  ghcr.io/dpendx/dpendx:latest
```

### Kubernetes

Using Secrets:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dpendx-secrets
type: Opaque
stringData:
  GITHUB_APP_ID: "123456"
  GITHUB_PRIVATE_KEY: "LS0tLS1CRUdJTi..."
  GITHUB_WEBHOOK_SECRET: "your_secret"
```

### Docker Compose

```yaml
services:
  dpendx:
    environment:
      - GITHUB_APP_ID=${GITHUB_APP_ID}
      - GITHUB_PRIVATE_KEY=${GITHUB_PRIVATE_KEY}
      - GITHUB_WEBHOOK_SECRET=${GITHUB_WEBHOOK_SECRET}
    env_file:
      - .env
```

## Validating Configuration

### Check Required Variables

dpendx validates configuration at startup:

```bash
$ ./dpendx
2024/01/15 10:00:00 ERROR failed to load configuration error="GITHUB_APP_ID environment variable is required"
```

### Verify Private Key

Test the private key is valid:

```bash
echo "$GITHUB_PRIVATE_KEY" | base64 -d | openssl rsa -check -noout
```

Expected output:
```
RSA key ok
```

### Test Webhook Secret

The secret must match exactly what's configured in GitHub App settings.

## Troubleshooting

### "GITHUB_APP_ID environment variable is required"

Ensure the variable is set and exported:
```bash
export GITHUB_APP_ID=123456
```

### "failed to decode GITHUB_PRIVATE_KEY from base64"

The private key must be base64-encoded:
```bash
# Re-encode the key
base64 -i your-key.pem | tr -d '\n'
```

### "Invalid signature"

The webhook secret doesn't match. Verify:
1. The secret in GitHub App settings
2. The `GITHUB_WEBHOOK_SECRET` environment variable
3. No extra whitespace or quotes

### Database Connection Errors

Verify the connection string:
```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1"
```

## Security Best Practices

1. **Use secret management** - AWS Secrets Manager, HashiCorp Vault, etc.
2. **Rotate secrets regularly** - Especially the private key and webhook secret
3. **Audit access** - Monitor who can view/modify secrets
4. **Use strong secrets** - Minimum 32 characters for webhook secret
5. **Encrypt at rest** - Ensure secrets storage is encrypted

## Next Steps

- [Deploy to Railway](/self-hosting/deployment/railway)
- [Deploy with Docker](/self-hosting/deployment/docker)
- [Configure database](/self-hosting/database-setup)

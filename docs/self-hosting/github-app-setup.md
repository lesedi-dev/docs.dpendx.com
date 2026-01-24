---
sidebar_position: 2
---

# GitHub App Setup

Create a private GitHub App for your self-hosted dpendx instance.

## Prerequisites

- GitHub account with admin access to an organization (for org-wide apps)
- Your dpendx deployment URL (or placeholder for initial setup)

## Step 1: Create New GitHub App

1. Navigate to GitHub App creation:
   - **Personal account**: Settings → Developer settings → GitHub Apps → New GitHub App
   - **Organization**: Organization Settings → Developer settings → GitHub Apps → New GitHub App

2. Or use direct links:
   - Personal: https://github.com/settings/apps/new
   - Organization: https://github.com/organizations/YOUR_ORG/settings/apps/new

## Step 2: Configure Basic Information

### App Name

Choose a unique name for your GitHub App:

| Field | Value |
|-------|-------|
| GitHub App name | `dpendx-yourcompany` (must be unique on GitHub) |
| Description | `Vulnerability scanner for Pull Requests` |
| Homepage URL | Your dpendx URL or company website |

### Webhook Configuration

| Field | Value |
|-------|-------|
| Webhook URL | `https://your-dpendx-domain.com/webhook` |
| Webhook secret | Generate a strong random string |

Generate a secure secret:
```bash
openssl rand -hex 32
```

:::warning Save Your Webhook Secret
You'll need this value for the `GITHUB_WEBHOOK_SECRET` environment variable.
:::

## Step 3: Configure Permissions

Set the following repository permissions:

### Repository Permissions

| Permission | Access | Purpose |
|------------|--------|---------|
| **Contents** | Read | Access dependency files and source code |
| **Checks** | Read & Write | Create and update check runs |
| **Pull requests** | Read | Receive PR webhook events |
| **Metadata** | Read | Basic repository information (required) |

### Organization Permissions (Optional)

| Permission | Access | Purpose |
|------------|--------|---------|
| **Members** | Read | Organization context for features |

## Step 4: Subscribe to Events

Enable these webhook events:

| Event | Purpose |
|-------|---------|
| **Pull request** | Trigger scans when PRs are opened/updated |
| **Check run** | Handle action button clicks |

## Step 5: Installation Settings

### Where can this GitHub App be installed?

Choose based on your needs:

| Option | Best For |
|--------|----------|
| **Only on this account** | Private/internal use |
| **Any account** | If you want others to install your app |

For self-hosted private use, select "Only on this account".

## Step 6: Create the App

Click **Create GitHub App**.

You'll be redirected to your app's settings page.

## Step 7: Generate Private Key

1. Scroll down to **Private keys** section
2. Click **Generate a private key**
3. A `.pem` file will download automatically

:::danger Protect Your Private Key
- Never commit this file to version control
- Store it securely (e.g., secret manager, encrypted storage)
- You cannot re-download this key if lost
:::

### Encode the Private Key

dpendx expects the private key as a base64-encoded string:

```bash
# macOS/Linux
base64 -i your-app-name.private-key.pem

# Or with line wrapping disabled
base64 -w 0 your-app-name.private-key.pem
```

:::tip
The encoded string should be one continuous line without newlines.
:::

## Step 8: Note Your App ID

Find your App ID at the top of the app settings page:

```
App ID: 123456
```

You'll need this for the `GITHUB_APP_ID` environment variable.

## Step 9: Install the App

### On Your Organization

1. Click **Install App** in the left sidebar
2. Select your organization
3. Choose repository access:
   - **All repositories** - Scan all repos
   - **Only select repositories** - Choose specific repos
4. Click **Install**

### On Your Personal Account

1. Click **Install App**
2. Click **Install** next to your username
3. Choose repository access
4. Click **Install**

## Required Environment Variables

After setup, you'll have these values:

```bash
# App ID from the settings page
GITHUB_APP_ID=123456

# Base64-encoded private key
GITHUB_PRIVATE_KEY=LS0tLS1CRUdJTi...

# Webhook secret you generated
GITHUB_WEBHOOK_SECRET=your_random_secret_here
```

## Verification Checklist

Verify your GitHub App configuration:

- [ ] App name is unique and descriptive
- [ ] Webhook URL points to your dpendx deployment
- [ ] Webhook secret is set and saved securely
- [ ] Repository permissions are correctly configured:
  - [ ] Contents: Read
  - [ ] Checks: Read & Write
  - [ ] Pull requests: Read
  - [ ] Metadata: Read
- [ ] Webhook events are subscribed:
  - [ ] Pull request
  - [ ] Check run
- [ ] Private key is downloaded and base64-encoded
- [ ] App ID is noted
- [ ] App is installed on target repositories

## Troubleshooting

### Webhook Not Receiving Events

1. Check the webhook URL is correct and accessible
2. Verify the webhook secret matches your configuration
3. Check GitHub's webhook delivery logs:
   - App settings → Advanced → Recent Deliveries

### Permission Errors

If dpendx can't create check runs or read files:

1. Verify permissions are set correctly in app settings
2. Re-install the app on affected repositories
3. Check that the installation has access to the specific repository

### Private Key Issues

If authentication fails:

1. Verify the private key is base64-encoded correctly
2. Ensure no newlines in the encoded string
3. Regenerate the private key if needed

## Updating the App

### Changing Webhook URL

When moving to a new domain:

1. Go to your app settings
2. Update the Webhook URL
3. Save changes

### Rotating Secrets

To rotate the webhook secret:

1. Generate a new secret
2. Update dpendx's environment variable
3. Redeploy dpendx
4. Update the GitHub App webhook secret
5. Verify webhooks are being received

### Generating New Private Key

1. Generate new private key in app settings
2. Base64-encode the new key
3. Update dpendx's environment variable
4. Redeploy dpendx
5. Delete the old private key from GitHub

## Next Steps

- [Deploy to Railway](/self-hosting/deployment/railway)
- [Deploy with Docker](/self-hosting/deployment/docker)
- [Configure environment variables](/self-hosting/environment-variables)

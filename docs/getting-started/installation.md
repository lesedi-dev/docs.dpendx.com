---
sidebar_position: 2
---

# Installation

This guide covers the complete installation process and explains each permission that dpendx requests.

## Installing from GitHub Marketplace

### Step 1: Navigate to the App

Visit the [dpendx GitHub App page](https://github.com/apps/dpendx/installations/select_target) and click **Install**.

### Step 2: Choose an Account

Select where you want to install dpendx:
- Your personal GitHub account
- An organization you have admin access to

### Step 3: Select Repositories

Choose which repositories dpendx should scan:

| Option | Best For |
|--------|----------|
| **All repositories** | Organizations that want comprehensive coverage |
| **Only select repositories** | Testing dpendx on specific projects first |

:::tip
You can change repository access anytime from your GitHub settings under **Applications** > **dpendx** > **Configure**.
:::

## Required Permissions

dpendx requests minimal permissions needed to function:

### Repository Permissions

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| Contents | Read | Access dependency files (package.json, go.mod, etc.) and source code for reachability analysis |
| Checks | Read & Write | Create check runs that show scan results in PRs |
| Pull requests | Read | Receive webhook events when PRs are opened or updated |
| Metadata | Read | Basic repository information (required by GitHub) |

### Organization Permissions

For organization installations, dpendx also requests:

| Permission | Access Level | Purpose |
|------------|--------------|---------|
| Members | Read | Identify organization context for billing and features |

## Webhook Events

dpendx subscribes to these webhook events:

| Event | Trigger |
|-------|---------|
| `pull_request.opened` | New PR is created |
| `pull_request.synchronize` | PR is updated with new commits |
| `pull_request.reopened` | Closed PR is reopened |
| `check_run.requested_action` | User clicks an action button in check results |

## Managing the Installation

### Changing Repository Access

1. Go to **Settings** > **Applications** in GitHub
2. Find **dpendx** and click **Configure**
3. Update repository selection
4. Click **Save**

### Suspending dpendx

If you need to temporarily disable scanning:

1. Go to **Settings** > **Applications** > **dpendx**
2. Click **Suspend**

This pauses all webhook processing. Click **Unsuspend** to resume.

### Uninstalling dpendx

To completely remove dpendx:

1. Go to **Settings** > **Applications** > **dpendx**
2. Click **Uninstall**

:::warning
Uninstalling removes all check runs created by dpendx from your PRs.
:::

## Verification

After installation, verify dpendx is working:

1. Open a test PR (or push a commit to an existing PR)
2. Look for the **dpendx** check in the PR's checks section
3. Wait for the scan to complete

If you don't see the check appear, see the [FAQ](/faq#why-doesnt-the-check-appear-on-my-pr).

## Next Steps

Now that dpendx is installed:

- [Learn what happens during your first scan](/getting-started/first-scan)
- [Understand scan results](/getting-started/understanding-results)

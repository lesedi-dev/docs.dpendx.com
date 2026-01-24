---
sidebar_position: 1
---

# Common Issues

Solutions for the most frequently encountered problems with dpendx.

## Check Run Not Appearing

**Symptom:** You opened a PR but the dpendx check doesn't appear.

### Possible Causes

1. **App not installed on repository**
   - Go to Settings → Applications → dpendx → Configure
   - Verify the repository is selected

2. **Webhook not configured**
   - Check GitHub App settings → Webhooks
   - Verify webhook URL is correct
   - Check webhook delivery logs for errors

3. **Webhook secret mismatch**
   - Ensure `GITHUB_WEBHOOK_SECRET` matches what's in GitHub App settings

4. **Service not running**
   - Check the health endpoint: `curl https://your-dpendx/health`
   - Check server logs for errors

5. **Network issues**
   - Verify the webhook URL is publicly accessible
   - Check firewall rules

### Debugging Steps

```bash
# 1. Check service health
curl https://your-dpendx-instance.com/health

# 2. Check GitHub webhook deliveries
# Go to: GitHub App settings → Advanced → Recent Deliveries

# 3. Check server logs
docker logs dpendx

# 4. Verify webhook URL is accessible
curl -X POST https://your-dpendx-instance.com/webhook
```

## Check Run Stuck on "In Progress"

**Symptom:** The check run shows "in progress" indefinitely.

### Possible Causes

1. **Scan timeout**
   - Large repositories may exceed the 5-minute timeout
   - Check logs for timeout errors

2. **GitHub API rate limit**
   - Too many file fetches can hit rate limits
   - Check logs for rate limit errors

3. **OSV API issues**
   - OSV database may be temporarily unavailable
   - Check logs for OSV errors

4. **Application crash**
   - The processing goroutine may have panicked
   - Check logs for panic stack traces

### Solutions

1. **Re-run the check**
   - Click "Details" on the check
   - Click "Re-run" button

2. **Check logs for errors**
   ```bash
   docker logs dpendx | grep -i "error\|panic\|timeout"
   ```

3. **Reduce repository size**
   - Use `.dpendxignore` to exclude directories (if supported)
   - Remove unused dependencies

## Wrong Vulnerabilities Shown

**Symptom:** dpendx reports vulnerabilities for packages not in your project.

### Possible Causes

1. **Stale cache**
   - Cache may have old data
   - Restart the service to clear cache

2. **Lock file mismatch**
   - Lock file doesn't match manifest
   - Run `npm install` / `go mod tidy` / etc.

3. **Monorepo issues**
   - Multiple dependency files being combined
   - Check which files are being parsed

### Solutions

1. **Sync lock files**
   ```bash
   # npm
   rm package-lock.json && npm install

   # Go
   go mod tidy

   # Python
   poetry lock
   ```

2. **Check parsed files in logs**
   - Look for "parsing" messages in logs
   - Verify correct files are being read

## "Imported" Status Incorrect

**Symptom:** Packages show wrong imported/not imported status.

### Possible Causes

1. **Dynamic imports not detected**
   - `require(variable)` style imports can't be analyzed
   - Only static imports are detected

2. **Aliased imports**
   - Unusual import aliases may not match

3. **Package name mismatch**
   - Import name differs from package name
   - Example: `PIL` import for `Pillow` package

### Solutions

1. **Use static imports**
   ```javascript
   // Detected
   import lodash from 'lodash';

   // Not detected
   const pkg = 'lodash';
   const lib = require(pkg);
   ```

2. **Check import patterns**
   - Review the ecosystem-specific import patterns
   - See [Reachability Analysis](/core-concepts/reachability-analysis)

## Scan Taking Too Long

**Symptom:** Scans take more than 30 seconds.

### Possible Causes

1. **Large dependency tree**
   - Hundreds of dependencies take longer
   - npm projects often have 500+ deps

2. **Cold cache**
   - First scan is slower (no cached OSV responses)
   - Subsequent scans are faster

3. **Network latency**
   - Slow connection to GitHub/OSV APIs
   - Geographic distance from servers

### Solutions

1. **Remove unused dependencies**
   ```bash
   npm prune
   go mod tidy
   ```

2. **Check cache status**
   - Look at `cache_size` in health response
   - Higher numbers mean more cached queries

3. **Use lock files**
   - Lock files provide exact versions
   - Faster than resolving version ranges

## Database Connection Errors

**Symptom:** Errors about database connection.

### Possible Causes

1. **Wrong connection string**
   - Typo in `DATABASE_URL`
   - Wrong password or host

2. **Network issues**
   - Database not reachable
   - Firewall blocking connection

3. **SSL issues**
   - SSL mode mismatch
   - Certificate problems

### Solutions

1. **Test connection**
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1"
   ```

2. **Check SSL mode**
   ```bash
   # For cloud databases
   DATABASE_URL=postgres://...?sslmode=require

   # For local development
   DATABASE_URL=postgres://...?sslmode=disable
   ```

3. **Check firewall**
   - Verify the database accepts connections from your IP
   - Check security groups / firewall rules

## Memory Issues

**Symptom:** Service crashes or becomes slow.

### Possible Causes

1. **Large repository**
   - Fetching many files uses memory
   - Parsing large dependency trees

2. **Memory limit too low**
   - Container or instance memory limit

3. **Memory leak**
   - Unlikely, but possible in edge cases

### Solutions

1. **Increase memory**
   ```yaml
   # Docker
   deploy:
     resources:
       limits:
         memory: 1G
   ```

2. **Monitor memory**
   ```bash
   docker stats dpendx
   ```

3. **Check for leaks**
   - Monitor memory over time
   - Report if memory continuously grows

## SSL Certificate Errors

**Symptom:** HTTPS errors or certificate warnings.

### Possible Causes

1. **Self-signed certificate**
   - Not trusted by GitHub
   - Webhooks fail silently

2. **Expired certificate**
   - Certificate needs renewal

3. **Wrong domain**
   - Certificate doesn't match webhook URL

### Solutions

1. **Use Let's Encrypt**
   - Free, auto-renewing certificates
   - Works with Traefik, Caddy, etc.

2. **Check certificate**
   ```bash
   openssl s_client -connect your-domain:443 -servername your-domain
   ```

3. **Verify domain matches**
   - Certificate CN/SAN must include your domain

## Still Having Issues?

If none of these solutions work:

1. **Check logs** - Most issues are visible in logs
2. **Search issues** - [GitHub Issues](https://github.com/dpendx/dpendx/issues)
3. **Ask for help** - [GitHub Discussions](https://github.com/dpendx/dpendx/discussions)
4. **Report a bug** - Include logs and reproduction steps

## Next Steps

- [Scan errors](/troubleshooting/scan-errors)
- [Webhook issues](/troubleshooting/webhook-issues)
- [Parser issues](/troubleshooting/parser-issues)

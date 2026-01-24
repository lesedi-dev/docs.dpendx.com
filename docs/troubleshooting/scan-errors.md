---
sidebar_position: 2
---

# Scan Errors

Troubleshoot errors that occur during vulnerability scanning.

## OSV API Errors

### "OSV query failed after 3 attempts"

**Cause:** The OSV API is unreachable or returning errors.

**Symptoms:**
- Check run shows neutral/warning
- Warnings mention OSV errors

**Solutions:**

1. **Check OSV status**
   - Visit [osv.dev](https://osv.dev)
   - Try manual query

2. **Check network**
   ```bash
   # From dpendx container
   curl -s https://api.osv.dev/v1/query
   ```

3. **Retry the scan**
   - Click "Re-run" on the check run
   - May succeed after transient failure

### "Rate limited by OSV"

**Cause:** Too many OSV queries in a short period.

**Solutions:**

1. **Wait and retry**
   - Rate limits typically reset quickly
   - Re-run the check after a few minutes

2. **Reduce dependencies**
   - Fewer dependencies = fewer queries
   - Remove unused packages

## File Fetching Errors

### "Failed to fetch [file]"

**Cause:** GitHub API error when retrieving files.

**Possible reasons:**
- File doesn't exist at the commit SHA
- Repository permissions issue
- GitHub API rate limit

**Solutions:**

1. **Verify file exists**
   ```bash
   gh api /repos/owner/repo/contents/package.json?ref=commit-sha
   ```

2. **Check permissions**
   - Verify dpendx has "Contents: Read" permission
   - Re-install the app if needed

3. **Check rate limits**
   ```bash
   gh api /rate_limit
   ```

### "Timeout fetching files"

**Cause:** Large repository or slow network.

**Solutions:**

1. **Retry the scan**
   - Transient network issues may resolve

2. **Check repository size**
   - Very large repos may need optimization
   - Consider splitting into smaller repos

## Parse Errors

### "[ecosystem] parser error"

**Cause:** Invalid or unexpected file format.

**Common causes:**
- Malformed JSON in package.json
- Invalid YAML in poetry.lock
- Syntax errors in dependency files

**Solutions:**

1. **Validate file syntax**
   ```bash
   # JSON
   cat package.json | jq .

   # YAML
   python -c "import yaml; yaml.safe_load(open('poetry.lock'))"
   ```

2. **Fix syntax errors**
   - Check for trailing commas (JSON)
   - Check indentation (YAML)

3. **Check file encoding**
   - Must be UTF-8
   - No BOM markers

### "Unsupported [ecosystem] format"

**Cause:** Using a dependency format not yet supported.

**Examples:**
- Gradle (build.gradle) - not supported
- Swift Package Manager (Package.swift) - not supported

**Solutions:**

1. **Use supported formats**
   - See [Ecosystems Overview](/ecosystems/overview)

2. **Request support**
   - Open a feature request on GitHub

## Reachability Analysis Errors

### "Failed to analyze imports"

**Cause:** Error parsing source files for imports.

**Possible reasons:**
- Syntax error in source files
- Unsupported language features
- File encoding issues

**Solutions:**

1. **Check for syntax errors**
   - Ensure code compiles/runs
   - Fix any syntax errors

2. **Check file extensions**
   - Verify files have correct extensions
   - `.js`, `.ts`, `.go`, `.py`, etc.

### "Import analysis skipped"

**Cause:** Source files not accessible or not found.

**Possible reasons:**
- No source files in expected locations
- Binary-only distribution
- Permissions issue

**Solutions:**

1. **Verify source files exist**
   - Check that code is in the repository
   - Not just in `.gitignore`

2. **Check file patterns**
   - See ecosystem-specific patterns
   - [Reachability Analysis](/core-concepts/reachability-analysis)

## Timeout Errors

### "Scan timeout after 5 minutes"

**Cause:** Scan took longer than the allowed time.

**Possible reasons:**
- Very large dependency tree
- Slow network
- OSV API delays

**Solutions:**

1. **Reduce dependencies**
   - Audit and remove unused packages
   - Use lighter alternatives

2. **Improve lock files**
   - Lock files parse faster than manifests
   - Commit your lock files

3. **Split repositories**
   - For monorepos, consider splitting
   - Each smaller repo scans faster

### "Context deadline exceeded"

**Cause:** Internal timeout on a specific operation.

**Solutions:**

1. **Retry the scan**
   - Transient issues may resolve

2. **Check logs for specifics**
   - Which operation timed out?
   - Network issue or processing issue?

## Database Errors

### "Failed to store scan result"

**Cause:** Database write failed.

**Possible reasons:**
- Database connection lost
- Disk full
- Constraint violation

**Solutions:**

1. **Check database connection**
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1"
   ```

2. **Check disk space**
   ```bash
   df -h
   ```

3. **Check for constraint errors**
   - Duplicate scan for same PR/SHA
   - Usually not a problem (scan still works)

## Error Messages in Warnings

Some errors are collected as warnings and don't fail the scan:

### "poetry.lock not found"

**Meaning:** pyproject.toml uses Poetry but no lock file exists.

**Impact:** Exact versions may not be determined.

**Solution:** Generate lock file: `poetry lock`

### "Unable to determine version"

**Meaning:** A dependency was found but version couldn't be parsed.

**Impact:** That specific dependency is skipped.

**Solution:** Use explicit version in manifest file.

### "Unknown ecosystem"

**Meaning:** A dependency file was found but ecosystem not recognized.

**Impact:** File is skipped.

**Solution:** Check supported ecosystems or report if it should be supported.

## Getting Help

If errors persist:

1. **Collect information**
   - Full error message
   - Server logs
   - Repository (if public)

2. **Search existing issues**
   - [GitHub Issues](https://github.com/dpendx/dpendx/issues)

3. **Open new issue**
   - Include error logs
   - Include steps to reproduce

## Next Steps

- [Webhook issues](/troubleshooting/webhook-issues)
- [Parser issues](/troubleshooting/parser-issues)
- [FAQ](/troubleshooting/faq)

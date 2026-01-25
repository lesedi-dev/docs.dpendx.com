---
sidebar_position: 6
---

# Ruby

dpendx scans Ruby projects for dependency vulnerabilities.

## What We Scan

- `Gemfile` - Your gem dependencies
- `Gemfile.lock` - Locked versions

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| nokogiri | 1.13.6 | HIGH | Yes | 1.13.10 |
| rack | 2.2.3 | HIGH | Yes | 2.2.4 |
| loofah | 2.18.0 | MEDIUM | No | 2.19.1 |

## How to Fix

```bash
# Update a specific gem
bundle update nokogiri

# Update all gems
bundle update

# Check for vulnerabilities
bundle audit
```

## Tips

- Always commit `Gemfile.lock` to your repository
- Run `bundle audit` periodically for security checks
- Vulnerabilities marked "Imported: Yes" are actively used in your code

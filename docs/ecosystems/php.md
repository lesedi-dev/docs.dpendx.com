---
sidebar_position: 9
---

# PHP

dpendx scans PHP projects for dependency vulnerabilities.

## What We Scan

- `composer.json` - Your Composer dependencies
- `composer.lock` - Locked versions

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| guzzlehttp/guzzle | 7.4.3 | HIGH | Yes | 7.4.5 |
| symfony/http-kernel | 5.4.7 | HIGH | Yes | 5.4.8 |
| monolog/monolog | 2.5.0 | MEDIUM | No | 2.6.0 |

## How to Fix

```bash
# Update a specific package
composer update guzzlehttp/guzzle

# Or specify version
composer require guzzlehttp/guzzle:^7.4.5

# Check for vulnerabilities
composer audit
```

## Tips

- Always commit `composer.lock` to your repository
- Run `composer audit` periodically (Composer 2.4+)
- Vulnerabilities marked "Imported: Yes" are actively used in your code

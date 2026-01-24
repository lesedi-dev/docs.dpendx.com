---
sidebar_position: 9
---

# PHP

dpendx supports PHP projects with Composer's composer.json/composer.lock parsing and PHP import analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `composer.json` | Manifest | Direct dependencies with version constraints |
| `composer.lock` | Lock | Full dependency tree with exact versions |

## composer.json Parsing

dpendx extracts packages from the require sections:

```json
{
    "name": "myvendor/my-project",
    "require": {
        "php": "^8.1",
        "laravel/framework": "^10.0",
        "guzzlehttp/guzzle": "^7.5",
        "monolog/monolog": "^3.0"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.0",
        "mockery/mockery": "^1.5"
    }
}
```

### Dependency Types

| Section | Scanned | Description |
|---------|---------|-------------|
| `require` | ✅ Yes | Production dependencies |
| `require-dev` | ✅ Yes | Development dependencies |

### Version Constraints

```json
{
    "require": {
        "vendor/package": "1.0.0",       // Exact version
        "vendor/package": "^1.0",        // Compatible (>=1.0.0 <2.0.0)
        "vendor/package": "~1.0.0",      // Next significant (~1.0.0 means >=1.0.0 <1.1.0)
        "vendor/package": ">=1.0 <2.0",  // Range
        "vendor/package": "*",           // Any version
        "vendor/package": "dev-main"     // Development branch
    }
}
```

## composer.lock Parsing

The lock file contains resolved versions:

```json
{
    "packages": [
        {
            "name": "guzzlehttp/guzzle",
            "version": "7.5.0",
            "require": {
                "guzzlehttp/promises": "^1.5",
                "guzzlehttp/psr7": "^1.9 || ^2.4"
            }
        },
        {
            "name": "guzzlehttp/promises",
            "version": "1.5.2"
        }
    ],
    "packages-dev": [
        {
            "name": "phpunit/phpunit",
            "version": "10.0.0"
        }
    ]
}
```

## Reachability Analysis

dpendx analyzes PHP files (`*.php`) for use statements.

### Detected Import Patterns

```php
<?php

// Namespace use
use GuzzleHttp\Client;
use Monolog\Logger;

// Grouped use
use Illuminate\Support\{
    Collection,
    Facades\Log,
    Str
};

// Aliased use
use GuzzleHttp\Client as HttpClient;

// Function import
use function GuzzleHttp\Promise\promise_for;

// Constant import
use const Monolog\Logger\DEBUG;

// Full namespace in code (also detected)
$client = new \GuzzleHttp\Client();
```

### Package Matching

Composer packages use `vendor/package` naming:

| Package | PHP Namespace | Match? |
|---------|---------------|--------|
| `guzzlehttp/guzzle` | `GuzzleHttp\*` | ✅ Yes |
| `monolog/monolog` | `Monolog\*` | ✅ Yes |
| `laravel/framework` | `Illuminate\*` | ✅ Yes |

:::note Namespace Mapping
PHP package names (vendor/package) often differ from namespaces. dpendx uses PSR-4 autoload mappings and common conventions to match packages to namespaces.
:::

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| guzzlehttp/guzzle | 7.4.3 | CVE-2022-31090 | HIGH | **Yes** | 7.4.5 |
| symfony/http-kernel | 5.4.7 | CVE-2022-24894 | HIGH | **Yes** | 5.4.8 |
| monolog/monolog | 2.5.0 | CVE-2021-32724 | MEDIUM | No | 2.6.0 |

## Remediation Commands

```bash
# Update a specific package
composer update guzzlehttp/guzzle

# Update with version constraint
composer require guzzlehttp/guzzle:^7.4.5

# Update all packages
composer update

# Show security advisories
composer audit

# Install with audit
composer install --audit
```

## Framework-Specific Considerations

### Laravel

Laravel uses the `illuminate/*` namespace:

```php
use Illuminate\Support\Collection;
use Illuminate\Http\Request;
```

Package: `laravel/framework` → Namespace: `Illuminate\*`

### Symfony

Symfony components are individual packages:

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Console\Command\Command;
```

Packages: `symfony/http-foundation`, `symfony/console`

## PSR-4 Autoloading

dpendx uses PSR-4 mappings from composer.json:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/",
            "Tests\\": "tests/"
        }
    }
}
```

This helps map package namespaces correctly.

## Platform Packages

Platform requirements are noted but don't create vulnerabilities:

```json
{
    "require": {
        "php": "^8.1",
        "ext-json": "*",
        "ext-mbstring": "*"
    }
}
```

## Best Practices

1. **Commit composer.lock** - Essential for reproducible builds
2. **Run `composer audit`** - Built-in security checking (Composer 2.4+)
3. **Update regularly** - `composer update` keeps packages current
4. **Use `composer outdated`** - See available updates

## Troubleshooting

### Namespace not detected

If a package's imports aren't detected:
- Check the PSR-4 autoload configuration
- The package may use an unusual namespace structure
- Try checking composer.lock for the package's namespace

### composer.lock out of sync

If lock file doesn't match composer.json:
```bash
composer update --lock
# Or regenerate completely
rm composer.lock && composer install
```

### Version constraint issues

If using dev-* versions:
```json
{
    "minimum-stability": "dev",
    "prefer-stable": true
}
```

Dev versions may not have vulnerability data in OSV.

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

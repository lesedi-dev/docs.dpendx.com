---
sidebar_position: 5
---

# Rust

dpendx scans Rust projects for dependency vulnerabilities.

## What We Scan

- `Cargo.toml` - Your crate dependencies
- `Cargo.lock` - Locked versions

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| hyper | 0.14.18 | HIGH | Yes | 0.14.26 |
| regex | 1.5.4 | HIGH | Yes | 1.5.5 |
| time | 0.1.44 | MEDIUM | No | 0.2.23 |

## How to Fix

```bash
# Update a specific crate
cargo update -p hyper

# Update all dependencies
cargo update

# Check for security advisories
cargo audit
```

## Tips

- Commit `Cargo.lock` for reproducible builds
- Run `cargo audit` for additional security checks
- Vulnerabilities marked "Imported: Yes" are actively used in your code

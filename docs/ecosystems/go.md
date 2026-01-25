---
sidebar_position: 2
---

# Go

dpendx scans Go projects for dependency vulnerabilities.

## What We Scan

- `go.mod` - Your module dependencies
- `go.sum` - Locked versions with checksums

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| github.com/dgrijalva/jwt-go | v3.2.0 | HIGH | Yes | Use github.com/golang-jwt/jwt |
| golang.org/x/text | v0.3.2 | MEDIUM | No | v0.3.3 |

## How to Fix

```bash
# Upgrade a specific package
go get github.com/pkg/errors@v0.9.2

# Clean up dependencies
go mod tidy
```

## Tips

- Commit both `go.mod` and `go.sum` to your repository
- Run `go mod tidy` to remove unused dependencies
- Vulnerabilities marked "Imported: Yes" are actively used in your code

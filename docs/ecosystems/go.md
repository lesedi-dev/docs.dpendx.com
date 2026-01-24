---
sidebar_position: 2
---

# Go

dpendx provides full support for Go modules with go.mod/go.sum parsing and Go import analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `go.mod` | Manifest | Direct dependencies with version constraints |
| `go.sum` | Lock | Checksums for all modules (includes transitive) |

## go.mod Parsing

dpendx extracts dependencies from `require` statements:

```go
module github.com/myorg/myproject

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/pkg/errors v0.9.1
    golang.org/x/sync v0.3.0
)

require (
    // indirect dependencies
    github.com/bytedance/sonic v1.9.1 // indirect
)
```

### Extracted Data

```go
Dependency{
    Name:      "github.com/gin-gonic/gin",
    Version:   "v1.9.1",
    Ecosystem: "Go",
    Direct:    true,
    Source:    "go.mod",
}
```

### Version Formats

Go module versions follow semantic versioning with the `v` prefix:

| Format | Example |
|--------|---------|
| Standard | `v1.2.3` |
| Pre-release | `v1.2.3-beta.1` |
| Pseudo-version | `v0.0.0-20230101120000-abcd1234` |

## go.sum Parsing

The `go.sum` file provides checksums for the complete dependency tree:

```
github.com/gin-gonic/gin v1.9.1 h1:4idEAncQnU5cB7BeOkPtxjfCSye0AAm1R0RVIqJ+Jmg=
github.com/gin-gonic/gin v1.9.1/go.mod h1:hPrL+YrG0e2z8+HL=
github.com/pkg/errors v0.9.1 h1:FEBLx1zS214owpjy7qsBeixbURkuhQAwrK5UwLGTwt4=
github.com/pkg/errors v0.9.1/go.mod h1:bwawxfHBFNV+L2hUp1rHADuf=
```

dpendx parses go.sum to capture all transitive dependencies with exact versions.

## Reachability Analysis

dpendx analyzes Go source files (`*.go`) for import statements.

### Detected Import Patterns

```go
// Single import
import "github.com/pkg/errors"

// Grouped imports
import (
    "fmt"
    "github.com/gin-gonic/gin"
    "github.com/pkg/errors"
)

// Aliased import
import errors "github.com/pkg/errors"
import e "github.com/pkg/errors"

// Dot import
import . "github.com/pkg/errors"

// Blank import (side effects)
import _ "github.com/lib/pq"
```

### Package Matching

dpendx matches vulnerable packages against imports:

| Vulnerable Package | Import | Match? |
|--------------------|--------|--------|
| `github.com/pkg/errors` | `github.com/pkg/errors` | ✅ Yes |
| `github.com/pkg/errors` | `github.com/pkg/errors/v2` | ✅ Yes (subpackage) |
| `github.com/gin-gonic/gin` | `github.com/gin-gonic/gin/binding` | ✅ Yes (subpackage) |
| `github.com/foo/bar` | `github.com/foo/baz` | ❌ No |

## Example Scan Result

For a Go project with vulnerabilities:

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| github.com/dgrijalva/jwt-go | v3.2.0 | CVE-2020-26160 | HIGH | **Yes** | Use github.com/golang-jwt/jwt |
| golang.org/x/text | v0.3.2 | CVE-2020-14040 | MEDIUM | No | v0.3.3 |

## Remediation Commands

dpendx provides Go-specific upgrade commands:

```bash
# Upgrade a specific module
go get github.com/pkg/errors@v0.9.2

# Upgrade all dependencies
go get -u ./...

# Tidy up go.mod and go.sum
go mod tidy
```

## Common Patterns

### Replace Directives

dpendx respects `replace` directives in go.mod:

```go
replace github.com/old/module => github.com/new/module v1.0.0
```

Replaced modules use the replacement's version for vulnerability checking.

### Vendor Directory

If your project uses vendoring (`go mod vendor`), dpendx still reads go.mod/go.sum for dependency information. The vendor directory itself is not scanned.

### Major Version Suffixes

Go modules with v2+ use version suffixes:

```go
import "github.com/go-redis/redis/v8"
```

dpendx correctly handles these as separate modules from v1.

## Best Practices

1. **Keep go.sum in version control** - Ensures reproducible builds and accurate scanning
2. **Run `go mod tidy` regularly** - Removes unused dependencies
3. **Update dependencies** - Use `go get -u` or tools like `dependabot`
4. **Check for indirect vulnerabilities** - Even indirect dependencies can be imported

## Troubleshooting

### "Module not found in go.sum"

If dpendx reports parsing errors for go.sum:
- Run `go mod download` to populate go.sum
- Ensure go.sum is committed to your repository

### Pseudo-versions

Pseudo-versions (`v0.0.0-20230101...`) are checked against OSV like any other version. However, OSV coverage for pseudo-versions may be limited.

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

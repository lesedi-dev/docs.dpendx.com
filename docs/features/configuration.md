---
sidebar_position: 4
---

# Configuration

dpendx can be configured per-repository using a `.dpendx.yml` file in your repository root.

## Configuration Precedence

Settings are resolved in this order, with later sources overriding earlier ones:

1. **Defaults** - Built-in sensible defaults
2. **Dashboard config** - Settings saved via the dpendx web dashboard
3. **`.dpendx.yml`** - File in your repository root (highest priority)

The `.dpendx.yml` file always wins, giving repository owners full control.

## Full Reference

```yaml
# .dpendx.yml - dpendx configuration
version: 1

# Scan behavior
scan:
  mode: "full"              # "diff" (changed files only) or "full" (all dependency files)
  ecosystems: []            # List of ecosystems to scan. Empty = auto-detect all.
                            # Valid: Go, npm, PyPI, crates.io, RubyGems, Maven, NuGet, Packagist, CocoaPods
  exclude_paths:            # Glob patterns for paths to skip
    - "vendor/**"
    - "test/fixtures/**"

# Vulnerability scanning
vulnerability:
  enabled: true
  severity_threshold: "low"   # Minimum severity to report: "low", "medium", "high", "critical"
  block_on: "imported"        # When to block PRs: "imported", "all", "critical_only"
  ignore_ids:                 # Vulnerability IDs to suppress
    - "CVE-2021-23337"
    - "GHSA-xxxx-xxxx-xxxx"

# Import reachability analysis
reachability:
  enabled: true
  transitive: false           # Check transitive (indirect) imports

# Code quality analysis
code_quality:
  enabled: false              # Disabled by default
  naming: true                # Language-specific naming conventions
  duplicates: true            # Duplicate code detection
  complexity:
    enabled: true
    threshold: 15             # Cyclomatic complexity threshold per function
  dead_code: true             # Unused imports, unreachable statements
  bug_patterns: true          # Common bug patterns (nil deref, unchecked errors)
  security: true              # Security anti-patterns (SQL injection, hardcoded secrets)

# License compliance
license:
  enabled: true
  policy: "permissive"        # "permissive", "copyleft_ok", or "custom"
  allowed:                    # Explicit allowlist (used with "custom" policy)
    - "MIT"
    - "Apache-2.0"
    - "BSD-3-Clause"
  blocked:                    # Explicit blocklist (used with "custom" policy)
    - "AGPL-3.0"
```

## Section Details

### `scan`

Controls what dpendx scans and how.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `"full"` | `"diff"` scans only changed dependency files. `"full"` scans all. |
| `ecosystems` | list | `[]` (auto-detect) | Restrict scanning to specific ecosystems. |
| `exclude_paths` | list | `[]` | Glob patterns for files/directories to skip. |

:::tip Diff Mode
Use `mode: "diff"` for faster scans on large monorepos. Only dependency files modified in the PR will be analyzed.
:::

### `vulnerability`

Controls vulnerability detection and PR blocking behavior.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | bool | `true` | Enable/disable vulnerability scanning. |
| `severity_threshold` | string | `"low"` | Minimum severity to report. Vulnerabilities below this level are hidden. |
| `block_on` | string | `"imported"` | When to block PRs. |
| `ignore_ids` | list | `[]` | Vulnerability IDs (CVE/GHSA) to suppress from results. |

**`block_on` values:**

| Value | Behavior |
|-------|----------|
| `"imported"` | Block only when vulnerable packages are imported in code (default) |
| `"all"` | Block on any vulnerability, whether imported or not |
| `"critical_only"` | Block only on CRITICAL severity vulnerabilities |

### `reachability`

Controls import-level reachability analysis.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | bool | `true` | Enable/disable reachability analysis. |
| `transitive` | bool | `false` | Also check transitive (indirect) imports. |

### `code_quality`

Controls the 6 code quality analyzers. See [Code Quality Analysis](./code-quality) for details on each analyzer.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | bool | `false` | Master toggle for all quality analyzers. |
| `naming` | bool | `true` | Check naming conventions per language. |
| `duplicates` | bool | `true` | Detect duplicate code blocks. |
| `complexity.enabled` | bool | `true` | Check function complexity. |
| `complexity.threshold` | int | `15` | Maximum cyclomatic complexity before flagging. |
| `dead_code` | bool | `true` | Detect unused imports and unreachable code. |
| `bug_patterns` | bool | `true` | Detect common bug patterns. |
| `security` | bool | `true` | Detect security anti-patterns. |

:::note
Individual analyzer toggles only take effect when `enabled: true` is set. The defaults above mean that enabling `code_quality.enabled` turns on all analyzers.
:::

### `license`

Controls license compliance policy. See [License Compliance](./license-compliance) for full details.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | bool | `true` | Enable/disable license checking. |
| `policy` | string | `"permissive"` | License policy preset. |
| `allowed` | list | `[]` | Explicit allowlist for `"custom"` policy. |
| `blocked` | list | `[]` | Explicit blocklist for `"custom"` policy. |

**`policy` values:**

| Value | Behavior |
|-------|----------|
| `"permissive"` | Allow permissive and weak copyleft. Warn on strong copyleft. |
| `"copyleft_ok"` | Allow all recognized licenses. Warn on unknown only. |
| `"custom"` | Use `allowed` and `blocked` lists for fine-grained control. |

## Example Configurations

### Minimal

Accept all defaults with vulnerability scanning and license checking:

```yaml
version: 1
```

### Recommended

Enable code quality with sensible settings:

```yaml
version: 1

scan:
  mode: "diff"

vulnerability:
  enabled: true
  severity_threshold: "medium"
  block_on: "imported"

code_quality:
  enabled: true
  security: true
  bug_patterns: true
  complexity:
    enabled: true
    threshold: 15
```

### Strict

Maximum coverage for security-conscious teams:

```yaml
version: 1

vulnerability:
  enabled: true
  severity_threshold: "low"
  block_on: "all"

reachability:
  enabled: true
  transitive: true

code_quality:
  enabled: true
  naming: true
  duplicates: true
  complexity:
    enabled: true
    threshold: 10
  dead_code: true
  bug_patterns: true
  security: true

license:
  enabled: true
  policy: "custom"
  allowed:
    - "MIT"
    - "Apache-2.0"
    - "BSD-2-Clause"
    - "BSD-3-Clause"
    - "ISC"
  blocked:
    - "GPL-3.0"
    - "AGPL-3.0"
```

## Validation

dpendx validates your configuration on each scan. Invalid values are reported as warnings:

- Unknown `scan.mode` values
- Invalid ecosystem names
- Invalid `severity_threshold` or `block_on` values
- Negative `complexity.threshold`
- Unknown `license.policy` values

Invalid configuration does not block scans. dpendx falls back to defaults for invalid fields and reports the validation error in the check run.

## Next Steps

- [Code Quality Analysis](./code-quality) - Details on each quality analyzer
- [License Compliance](./license-compliance) - License policy configuration
- [SBOM Generation](./sbom-generation) - Export dependency inventories

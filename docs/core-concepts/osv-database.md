---
sidebar_position: 5
---

# OSV Database

Understand the Open Source Vulnerabilities database that powers dpendx's vulnerability detection.

## What Is OSV?

[OSV (Open Source Vulnerabilities)](https://osv.dev) is a vulnerability database and triage infrastructure for open source projects. It aggregates vulnerabilities from multiple sources into a single, queryable database.

OSV is:
- **Open source** - Maintained by Google and the open source community
- **Multi-ecosystem** - Covers all major package managers
- **Machine-readable** - Designed for automated tools like dpendx
- **Continuously updated** - New vulnerabilities added within hours of disclosure

## Data Sources

OSV aggregates vulnerabilities from:

| Source | Coverage |
|--------|----------|
| [GitHub Advisory Database](https://github.com/advisories) | npm, PyPI, RubyGems, Maven, NuGet, Go, Rust, Pub, Packagist |
| [PyPI Advisory Database](https://github.com/pypa/advisory-database) | PyPI (Python) |
| [Go Vulnerability Database](https://vuln.go.dev/) | Go |
| [Rust Advisory Database](https://rustsec.org/) | crates.io (Rust) |
| [Global Security Database](https://github.com/cloudsecurityalliance/gsd-database) | Multi-ecosystem |
| [OSS-Fuzz](https://github.com/google/oss-fuzz-vulns) | C/C++ and other fuzzing targets |

## Vulnerability Identifiers

Each vulnerability has multiple identifiers:

### OSV ID

The primary identifier in OSV format:
- **GHSA-xxxx-xxxx-xxxx** - GitHub Security Advisory
- **PYSEC-YYYY-NNNN** - Python Security Advisory
- **GO-YYYY-NNNN** - Go Vulnerability Database
- **RUSTSEC-YYYY-NNNN** - Rust Security Advisory

### Aliases

Alternative identifiers for the same vulnerability:
- **CVE-YYYY-NNNNN** - Common Vulnerabilities and Exposures
- **CGA-xxxx-xxxx-xxxx** - Chainguard Advisory

Example mapping:
```json
{
  "id": "GHSA-35jh-r3h4-6jhm",
  "aliases": [
    "CVE-2021-23337"
  ]
}
```

## OSV Schema

Each vulnerability follows the [OSV Schema](https://ossf.github.io/osv-schema/):

```json
{
  "schema_version": "1.4.0",
  "id": "GHSA-35jh-r3h4-6jhm",
  "aliases": ["CVE-2021-23337"],
  "summary": "Command Injection in lodash",
  "details": "Lodash versions prior to 4.17.21 are vulnerable to...",
  "severity": [
    {
      "type": "CVSS_V3",
      "score": "CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H"
    }
  ],
  "affected": [
    {
      "package": {
        "ecosystem": "npm",
        "name": "lodash"
      },
      "ranges": [
        {
          "type": "SEMVER",
          "events": [
            {"introduced": "0"},
            {"fixed": "4.17.21"}
          ]
        }
      ]
    }
  ],
  "references": [
    {
      "type": "ADVISORY",
      "url": "https://github.com/advisories/GHSA-35jh-r3h4-6jhm"
    }
  ],
  "published": "2021-02-13T00:00:00Z",
  "modified": "2023-04-11T01:31:42Z"
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `id` | Primary OSV identifier |
| `aliases` | Alternative identifiers (CVE, etc.) |
| `summary` | Brief description |
| `details` | Full vulnerability description |
| `severity` | CVSS score and severity rating |
| `affected` | Which packages/versions are affected |
| `references` | Links to advisories and fixes |

## Affected Version Ranges

OSV uses semantic versioning ranges to specify affected versions:

```json
{
  "ranges": [
    {
      "type": "SEMVER",
      "events": [
        {"introduced": "0"},      // Vulnerable from version 0
        {"fixed": "4.17.21"}      // Fixed in 4.17.21
      ]
    }
  ]
}
```

### Range Types

| Type | Description | Example |
|------|-------------|---------|
| `SEMVER` | Semantic versioning | `>=1.0.0, <1.5.0` |
| `ECOSYSTEM` | Ecosystem-specific | Python version specifiers |
| `GIT` | Git commit ranges | Commit SHA ranges |

### Multiple Ranges

A vulnerability can affect multiple version ranges:

```json
{
  "ranges": [
    {
      "events": [
        {"introduced": "0"},
        {"fixed": "1.2.3"}
      ]
    },
    {
      "events": [
        {"introduced": "2.0.0"},
        {"fixed": "2.1.0"}
      ]
    }
  ]
}
```

This means: vulnerable in `0 <= v < 1.2.3` AND `2.0.0 <= v < 2.1.0`.

## Severity Ratings

OSV provides severity via CVSS (Common Vulnerability Scoring System):

### CVSS v3.x Scores

| Score Range | Severity |
|-------------|----------|
| 9.0 - 10.0 | CRITICAL |
| 7.0 - 8.9 | HIGH |
| 4.0 - 6.9 | MEDIUM |
| 0.1 - 3.9 | LOW |

### CVSS Vector String

```
CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H
```

Components:
- **AV** (Attack Vector): Network, Adjacent, Local, Physical
- **AC** (Attack Complexity): Low, High
- **PR** (Privileges Required): None, Low, High
- **UI** (User Interaction): None, Required
- **S** (Scope): Unchanged, Changed
- **C/I/A** (Confidentiality/Integrity/Availability Impact): None, Low, High

## Querying OSV

### API Endpoint

```
POST https://api.osv.dev/v1/query
```

### Request Format

```json
{
  "package": {
    "name": "lodash",
    "ecosystem": "npm"
  },
  "version": "4.17.20"
}
```

### Response Format

```json
{
  "vulns": [
    {
      "id": "GHSA-35jh-r3h4-6jhm",
      "summary": "Command Injection in lodash",
      ...
    }
  ]
}
```

### Batch Queries

Query multiple packages at once:

```
POST https://api.osv.dev/v1/querybatch
```

```json
{
  "queries": [
    {
      "package": {"name": "lodash", "ecosystem": "npm"},
      "version": "4.17.20"
    },
    {
      "package": {"name": "minimist", "ecosystem": "npm"},
      "version": "1.2.5"
    }
  ]
}
```

## Ecosystem Coverage

OSV covers all major package ecosystems:

| Ecosystem | OSV Name | Coverage |
|-----------|----------|----------|
| npm | `npm` | Excellent |
| PyPI | `PyPI` | Excellent |
| Go | `Go` | Excellent |
| crates.io | `crates.io` | Excellent |
| RubyGems | `RubyGems` | Good |
| Maven | `Maven` | Good |
| NuGet | `NuGet` | Good |
| Packagist | `Packagist` | Good |
| CocoaPods | `CocoaPods` | Moderate |

## Update Frequency

- **New disclosures**: Added within hours
- **Database sync**: Continuous
- **dpendx cache**: 4-hour TTL

## Browsing Vulnerabilities

Visit [osv.dev](https://osv.dev) to:
- Search vulnerabilities by package name
- View affected versions
- Find remediation guidance
- Export data for analysis

## Contributing to OSV

Found a vulnerability not in OSV? You can contribute:

1. Open an issue at [github.com/google/osv.dev](https://github.com/google/osv.dev)
2. Submit to the appropriate source (GitHub Advisory, RustSec, etc.)
3. Vulnerabilities propagate to OSV automatically

## Next Steps

- [Understand how dpendx uses OSV](/core-concepts/vulnerability-scanning)
- [Learn about check run outcomes](/core-concepts/check-run-outcomes)
- [Explore supported ecosystems](/ecosystems/overview)

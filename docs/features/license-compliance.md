---
sidebar_position: 2
---

# License Compliance

dpendx checks your dependencies for license compliance issues alongside vulnerability scanning.

## Why License Compliance Matters

Open source licenses carry legal obligations. Using a dependency with an incompatible license can:

- **Create legal liability** for your organization
- **Require code disclosure** if using copyleft licenses
- **Block commercial distribution** of your software
- **Cause compliance audit failures**

## How It Works

During each scan, dpendx:

1. Extracts license information from your dependency manifests
2. Classifies each license into categories
3. Checks against the configured license policy
4. Reports violations in the PR comment

## License Categories

dpendx classifies licenses into four categories:

| Category | Examples | Risk Level |
|----------|----------|------------|
| **Permissive** | MIT, Apache-2.0, BSD-3-Clause, ISC | Low - free to use commercially |
| **Weak Copyleft** | LGPL, MPL, EPL | Medium - may require attribution |
| **Copyleft** | GPL, AGPL | High - may require code disclosure |
| **Unknown** | Missing or unrecognized | Unknown - requires investigation |

### Permissive Licenses

Generally safe for commercial use with minimal obligations:

- MIT, ISC, BSD-2-Clause, BSD-3-Clause
- Apache-2.0, Apache-1.1
- Unlicense, 0BSD, WTFPL
- CC0-1.0, Zlib, BSL-1.0

### Weak Copyleft Licenses

Allow linking without triggering copyleft requirements:

- LGPL-2.1, LGPL-3.0
- MPL-2.0 (Mozilla Public License)
- EPL (Eclipse Public License)
- CDDL, OSL

### Strong Copyleft Licenses

May require you to open source your code:

- GPL-2.0, GPL-3.0
- AGPL-3.0 (especially restrictive for SaaS)
- CC-BY-SA, CC-BY-NC-SA

:::warning AGPL in SaaS
AGPL-3.0 requires source code disclosure even when software is provided over a network. This is particularly risky for SaaS applications.
:::

## Default Policy

dpendx uses a sensible default policy that:

| License Type | Default Action |
|--------------|----------------|
| Permissive | Allow |
| Weak Copyleft | Allow |
| Strong Copyleft (GPL, AGPL) | Warn |
| Unknown/Missing | Warn |

:::tip No Blocking by Default
The default policy warns but does not block PRs. This prevents unexpected build failures while still providing visibility.
:::

## PR Comment License Section

When license issues are found, dpendx adds a **LICENSE** badge to the PR comment:

```
LICENSE  2 issues

### License Compliance

| Package | Version | License | Issue |
|---------|---------|---------|-------|
| some-pkg | 1.0.0 | GPL-3.0 | copyleft license |
| other-pkg | 2.0.0 | Unknown | unknown license |
```

## License Detection by Ecosystem

License detection capabilities vary by ecosystem:

| Ecosystem | License Source | Coverage |
|-----------|---------------|----------|
| **npm** | `package.json` license field | Excellent |
| **PHP** | `composer.json` license field | Excellent |
| **Python** | `pyproject.toml` classifiers | Good |
| **Go** | Not in go.mod/go.sum | Limited |
| **Rust** | Not in Cargo.lock | Limited |
| **Ruby** | Not in Gemfile.lock | Limited |
| **Java** | Not in pom.xml (usually) | Limited |
| **.NET** | Not in packages.lock.json | Limited |
| **CocoaPods** | Not in Podfile.lock | Limited |

:::warning Lock File Limitations
Many lock file formats don't include license information. For full license coverage, consider using a dedicated license scanning tool alongside dpendx.
:::

## Handling Unknown Licenses

Dependencies with unknown licenses appear for several reasons:

1. **No license declared** - The package author didn't specify a license
2. **Non-SPDX license** - The license uses a non-standard identifier
3. **Parser limitation** - The ecosystem parser doesn't extract licenses

### Recommended Actions

For dependencies with unknown licenses:

```bash
# npm - check package details
npm info <package-name> license

# Go - check the repository
go doc -all <module-path>

# Python - check PyPI
pip show <package-name>
```

## License Normalization

dpendx normalizes common license variations to standard SPDX identifiers:

| Input | Normalized |
|-------|------------|
| "MIT License" | MIT |
| "Apache 2.0" | Apache-2.0 |
| "BSD" | BSD-3-Clause |
| "GPLv3" | GPL-3.0 |
| "LGPLv2" | LGPL-2.1 |

## SBOM License Information

License information is included in SBOM exports when available:

```json
{
  "name": "lodash",
  "version": "4.17.21",
  "purl": "pkg:npm/lodash@4.17.21",
  "licenses": [
    {
      "license": {
        "id": "MIT"
      }
    }
  ]
}
```

See [SBOM Generation](./sbom-generation) for more details.

## Best Practices

1. **Review unknown licenses** - Investigate packages without license information
2. **Document exceptions** - Keep a record of approved copyleft usage
3. **Use allowlists** - Maintain a list of pre-approved packages
4. **Scan regularly** - License information can change between versions
5. **Prefer permissive** - When alternatives exist, choose permissively-licensed packages

## Limitations

- License detection depends on manifest/lock file formats
- Some ecosystems (Go, Rust, Ruby) have limited license metadata in lock files
- Complex license expressions (e.g., "MIT OR Apache-2.0") may not be fully parsed
- Custom or proprietary licenses are reported as "unknown"

## Next Steps

- [SBOM Generation](./sbom-generation) - Export SBOMs with license data
- [Ecosystems Overview](/ecosystems/overview) - See what files we scan per ecosystem
- [Understanding Results](/getting-started/understanding-results) - Interpret scan findings

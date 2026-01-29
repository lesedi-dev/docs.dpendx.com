---
sidebar_position: 1
---

# SBOM Generation

dpendx can generate Software Bill of Materials (SBOM) documents for your scanned repositories.

## What is an SBOM?

A Software Bill of Materials (SBOM) is a comprehensive inventory of all software components, libraries, and dependencies in your application. SBOMs are increasingly required for:

- **Security compliance** - Many regulations now mandate SBOM generation
- **Vulnerability management** - Know exactly what's in your software
- **Supply chain security** - Track dependencies across your organization
- **License compliance** - Identify licenses used by your dependencies

## Supported Format

dpendx generates SBOMs in **CycloneDX 1.5 JSON** format, a widely-adopted OWASP standard.

:::tip Why CycloneDX?
CycloneDX is designed specifically for software security use cases and is supported by most vulnerability management platforms, including OWASP Dependency-Track, Snyk, and others.
:::

## API Endpoint

Export an SBOM for any completed scan:

```bash
GET /api/sbom/{scan_id}
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `scan_id` | Yes | The ID of the scan report |
| `format` | No | Output format (default: `cyclonedx`) |

### Example Request

```bash
curl -X GET "https://your-dpendx-instance/api/sbom/abc123" \
  -H "Accept: application/vnd.cyclonedx+json"
```

### Response Headers

```
Content-Type: application/vnd.cyclonedx+json; version=1.5
Content-Disposition: attachment; filename="sbom-abc123.json"
```

## SBOM Structure

The generated SBOM includes:

- **Metadata** - Timestamp, tool info, repository details
- **Components** - All dependencies with PURL identifiers
- **Licenses** - License information when available

### Example Output

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:abc123",
  "version": 1,
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "tools": [
      {
        "vendor": "dpendx",
        "name": "dpendx",
        "version": "1.0.0"
      }
    ],
    "component": {
      "type": "application",
      "bom-ref": "root",
      "name": "owner/repo",
      "version": "abc123def"
    }
  },
  "components": [
    {
      "type": "library",
      "bom-ref": "pkg:npm/lodash@4.17.21",
      "name": "lodash",
      "version": "4.17.21",
      "purl": "pkg:npm/lodash@4.17.21",
      "scope": "required",
      "licenses": [
        {
          "license": {
            "id": "MIT"
          }
        }
      ],
      "properties": [
        {
          "name": "dpendx:ecosystem",
          "value": "npm"
        }
      ]
    }
  ]
}
```

## Package URL (PURL) Format

Each component includes a [PURL](https://github.com/package-url/purl-spec) identifier for precise package identification:

| Ecosystem | PURL Format | Example |
|-----------|-------------|---------|
| npm | `pkg:npm/{name}@{version}` | `pkg:npm/lodash@4.17.21` |
| npm (scoped) | `pkg:npm/%40scope/name@{version}` | `pkg:npm/%40types/node@18.0.0` |
| Go | `pkg:golang/{module}@{version}` | `pkg:golang/github.com/gin-gonic/gin@1.9.0` |
| Python | `pkg:pypi/{name}@{version}` | `pkg:pypi/requests@2.31.0` |
| Rust | `pkg:cargo/{name}@{version}` | `pkg:cargo/serde@1.0.0` |
| Ruby | `pkg:gem/{name}@{version}` | `pkg:gem/rails@7.0.0` |
| Java | `pkg:maven/{group}/{artifact}@{version}` | `pkg:maven/org.apache/commons-lang3@3.12.0` |
| .NET | `pkg:nuget/{name}@{version}` | `pkg:nuget/Newtonsoft.Json@13.0.0` |
| PHP | `pkg:composer/{vendor}/{package}@{version}` | `pkg:composer/symfony/console@6.0.0` |
| CocoaPods | `pkg:cocoapods/{name}@{version}` | `pkg:cocoapods/Alamofire@5.6.0` |

## Component Details

### Scope

Components include a scope indicating their relationship to your project:

| Scope | Meaning |
|-------|---------|
| `required` | Direct dependency declared in your manifest |
| `optional` | Transitive dependency (dependency of a dependency) |

### Licenses

When license information is available from the package manager, it's included in SPDX format:

```json
"licenses": [
  {
    "license": {
      "id": "MIT"
    }
  }
]
```

### Custom Properties

dpendx adds custom properties to track additional metadata:

| Property | Description |
|----------|-------------|
| `dpendx:ecosystem` | The package ecosystem (npm, Go, PyPI, etc.) |
| `dpendx:source` | Source file where dependency was declared |
| `dpendx:scan_id` | ID of the scan that generated this SBOM |

## Use Cases

### Import into Dependency-Track

[OWASP Dependency-Track](https://dependencytrack.org/) can ingest CycloneDX SBOMs:

```bash
curl -X POST "https://dependency-track/api/v1/bom" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/vnd.cyclonedx+json" \
  -d @sbom.json
```

### Compliance Reporting

Save SBOMs as build artifacts for audit trails:

```yaml
# GitHub Actions example
- name: Export SBOM
  run: |
    curl -o sbom.json "https://dpendx/api/sbom/${{ env.SCAN_ID }}"

- name: Upload SBOM artifact
  uses: actions/upload-artifact@v3
  with:
    name: sbom
    path: sbom.json
```

## Limitations

- SBOMs are only available for scans stored in the database (requires persistence to be enabled)
- Only CycloneDX JSON format is currently supported
- Dependency relationships (dependency graph) are not yet included

## Next Steps

- [License Compliance](./license-compliance) - Learn about license policy checking
- [Understanding Results](/getting-started/understanding-results) - Interpret vulnerability findings

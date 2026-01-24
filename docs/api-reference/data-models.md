---
sidebar_position: 6
---

# Data Models

Reference for all data types used in dpendx's API and internal processing.

## Core Models

### Dependency

Represents a single dependency extracted from a manifest or lock file.

```typescript
interface Dependency {
  name: string;      // Package name (e.g., "lodash", "github.com/pkg/errors")
  version: string;   // Version string (e.g., "4.17.21", "v1.0.0")
  ecosystem: string; // OSV ecosystem identifier
  direct: boolean;   // True if direct dependency (vs transitive)
  source: string;    // Which file it came from
}
```

**Example:**

```json
{
  "name": "lodash",
  "version": "4.17.21",
  "ecosystem": "npm",
  "direct": true,
  "source": "package-lock.json"
}
```

### Vulnerability

Represents a security vulnerability from the OSV database.

```typescript
interface Vulnerability {
  id: string;              // OSV ID (e.g., "GHSA-xxxx-xxxx-xxxx")
  aliases: string[];       // Alternative identifiers (e.g., CVE IDs)
  summary: string;         // Brief description
  details: string;         // Full description
  severity: Severity;      // Severity level
  fixed_version: string;   // Recommended version to upgrade to
  affected_ranges: string; // Vulnerable version range
  url: string;             // Advisory URL
}
```

**Example:**

```json
{
  "id": "GHSA-35jh-r3h4-6jhm",
  "aliases": ["CVE-2021-23337"],
  "summary": "Command Injection in lodash",
  "details": "Lodash versions prior to 4.17.21 are vulnerable to Command Injection via the template function.",
  "severity": "HIGH",
  "fixed_version": "4.17.21",
  "affected_ranges": ">=0, <4.17.21",
  "url": "https://github.com/advisories/GHSA-35jh-r3h4-6jhm"
}
```

### ScanFinding

Links a vulnerable dependency with its vulnerability details and reachability status.

```typescript
interface ScanFinding {
  dependency: Dependency;
  vulnerability: Vulnerability;
  is_imported: boolean;  // True if the package is imported in code
}
```

**Example:**

```json
{
  "dependency": {
    "name": "lodash",
    "version": "4.17.20",
    "ecosystem": "npm",
    "direct": true,
    "source": "package-lock.json"
  },
  "vulnerability": {
    "id": "GHSA-35jh-r3h4-6jhm",
    "aliases": ["CVE-2021-23337"],
    "summary": "Command Injection in lodash",
    "severity": "HIGH",
    "fixed_version": "4.17.21"
  },
  "is_imported": true
}
```

### ScanResult

Complete results of a vulnerability scan.

```typescript
interface ScanResult {
  findings: ScanFinding[];  // All vulnerabilities found
  total_deps: number;       // Total dependencies scanned
  ecosystems: string[];     // Ecosystems scanned
  scanned_at: string;       // ISO 8601 timestamp
  duration: number;         // Scan duration in milliseconds
  errors: string[];         // Non-fatal errors (warnings)
}
```

**Example:**

```json
{
  "findings": [
    {
      "dependency": {
        "name": "lodash",
        "version": "4.17.20",
        "ecosystem": "npm"
      },
      "vulnerability": {
        "id": "GHSA-35jh-r3h4-6jhm",
        "severity": "HIGH",
        "fixed_version": "4.17.21"
      },
      "is_imported": true
    }
  ],
  "total_deps": 47,
  "ecosystems": ["npm", "Go"],
  "scanned_at": "2024-01-15T10:30:00Z",
  "duration": 2341,
  "errors": ["poetry.lock not found"]
}
```

## Enums

### Severity

Vulnerability severity levels.

```typescript
type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
```

| Value | CVSS Score | Description |
|-------|------------|-------------|
| `CRITICAL` | 9.0 - 10.0 | Severe, often RCE |
| `HIGH` | 7.0 - 8.9 | Significant risk |
| `MEDIUM` | 4.0 - 6.9 | Moderate risk |
| `LOW` | 0.1 - 3.9 | Minor risk |
| `UNKNOWN` | N/A | Severity not determined |

### Ecosystem

Supported package ecosystems.

```typescript
type Ecosystem =
  | "Go"
  | "npm"
  | "PyPI"
  | "crates.io"
  | "RubyGems"
  | "Maven"
  | "NuGet"
  | "Packagist"
  | "CocoaPods";
```

### CheckConclusion

GitHub Check Run conclusion values.

```typescript
type CheckConclusion = "success" | "failure" | "neutral";
```

| Value | Meaning |
|-------|---------|
| `success` | No vulnerabilities found |
| `failure` | Imported vulnerabilities found |
| `neutral` | Non-imported vulns or scan error |

## API Request/Response Models

### ScanRequest

Request body for `/api/scan`.

```typescript
interface ScanRequest {
  installation_id: number;  // GitHub App installation ID
  owner: string;            // Repository owner
  repo: string;             // Repository name
  ref: string;              // Branch or tag name
  sha?: string;             // Specific commit SHA (optional)
}
```

### ScanResponse

Response from `/api/scan`.

```typescript
interface ScanResponse {
  status: "accepted" | "success" | "error";
  scan_id?: string;         // UUID of the scan
  result?: ScanResult;      // Scan results (if complete)
  message?: string;         // Status message
  error?: ApiError;         // Error details (if error)
}
```

### FixRequest

Request body for `/api/fix`.

```typescript
interface FixRequest {
  installation_id: number;  // GitHub App installation ID
  scan_report_id: string;   // UUID of scan to fix
}
```

### FixResponse

Response from `/api/fix`.

```typescript
interface FixResponse {
  status: "success" | "error";
  pull_request?: {
    number: number;
    url: string;
    title: string;
    fixes_count: number;
  };
  message?: string;
  error?: ApiError;
}
```

### ApiError

Error details in API responses.

```typescript
interface ApiError {
  code: string;     // Error code (e.g., "invalid_request")
  message: string;  // Human-readable message
}
```

### HealthResponse

Response from `/health`.

```typescript
interface HealthResponse {
  status: "healthy";
  version: string;
  cache_size: number;
  uptime_seconds: number;
}
```

## Database Models

### ScanReport (Database)

Stored scan report for persistence.

```typescript
interface ScanReportRecord {
  id: string;                 // UUID
  repo_owner: string;
  repo_name: string;
  pr_number: number;
  head_sha: string;
  conclusion: CheckConclusion;
  total_deps: number;
  vulnerability_count: number;
  imported_count: number;
  ecosystems: string[];
  duration_ms: number;
  created_at: string;         // ISO 8601
}
```

### ScanFindingRecord (Database)

Stored scan finding.

```typescript
interface ScanFindingRecord {
  id: string;                  // UUID
  scan_report_id: string;      // Foreign key
  package_name: string;
  package_version: string;
  ecosystem: string;
  vulnerability_id: string;
  severity: Severity;
  is_imported: boolean;
  fixed_version: string | null;
  created_at: string;
}
```

## GitHub Models

### CheckOutput

Output for GitHub Check Run.

```typescript
interface CheckOutput {
  title: string;    // Check title (e.g., "✅ No vulnerabilities found")
  summary: string;  // Brief summary
  text: string;     // Full markdown content
}
```

### CheckRunAction

Action button in Check Run.

```typescript
interface CheckRunAction {
  label: string;        // Button text
  description: string;  // Tooltip
  identifier: string;   // Action ID (e.g., "fix:abc123")
}
```

## Type Definitions (TypeScript)

Full TypeScript definitions for client use:

```typescript
// dpendx.d.ts

export interface Dependency {
  name: string;
  version: string;
  ecosystem: Ecosystem;
  direct: boolean;
  source: string;
}

export interface Vulnerability {
  id: string;
  aliases: string[];
  summary: string;
  details: string;
  severity: Severity;
  fixed_version: string;
  affected_ranges: string;
  url: string;
}

export interface ScanFinding {
  dependency: Dependency;
  vulnerability: Vulnerability;
  is_imported: boolean;
}

export interface ScanResult {
  findings: ScanFinding[];
  total_deps: number;
  ecosystems: Ecosystem[];
  scanned_at: string;
  duration: number;
  errors: string[];
}

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type Ecosystem =
  | "Go"
  | "npm"
  | "PyPI"
  | "crates.io"
  | "RubyGems"
  | "Maven"
  | "NuGet"
  | "Packagist"
  | "CocoaPods";

export type CheckConclusion = "success" | "failure" | "neutral";
```

## Next Steps

- [API overview](/api-reference/overview)
- [Scan endpoint](/api-reference/scan-endpoint)
- [Understanding results](/getting-started/understanding-results)

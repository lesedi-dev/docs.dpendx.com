---
sidebar_position: 1
---

# How It Works

Understand dpendx's architecture and the complete scanning pipeline.

## Architecture Overview

dpendx is a Go application that runs as a webhook server, processing GitHub events and interacting with external services:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GitHub                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │ Pull Request │───▶│   Webhook    │───▶│  Checks API  │           │
│  └──────────────┘    └──────────────┘    └──────────────┘           │
│         │                   │                   ▲                    │
│         │                   │                   │                    │
└─────────│───────────────────│───────────────────│────────────────────┘
          │                   │                   │
          │                   ▼                   │
          │         ┌─────────────────┐          │
          │         │    dpendx       │          │
          │         │                 │──────────┘
          │         │  ┌───────────┐  │
          │         │  │  Scanner  │  │
          │         │  └───────────┘  │
          │         │        │        │
          │         │        ▼        │
          │         │  ┌───────────┐  │
          │         │  │  Parsers  │  │
          │         │  └───────────┘  │
          │         │        │        │
          │         │        ▼        │
          │         │  ┌───────────┐  │
          │         │  │   OSV     │◀─┼──────────┐
          │         │  │  Client   │  │          │
          │         │  └───────────┘  │          │
          │         │        │        │          │
          │         │        ▼        │          │
          │         │  ┌───────────┐  │          │
          │         │  │Reachability│  │          │
          │         │  │ Analyzer  │  │          │
          │         │  └───────────┘  │          │
          │         └─────────────────┘          │
          │                                      │
          │                              ┌───────┴───────┐
          └─────────────────────────────▶│  OSV Database │
                                         │   (osv.dev)   │
                                         └───────────────┘
```

## Component Breakdown

### Webhook Handler

Receives and validates GitHub webhook events:

```go
// Signature validation using HMAC-SHA256
func (h *WebhookHandler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
    // Validate webhook signature
    signature := r.Header.Get("X-Hub-Signature-256")
    if !validateSignature(payload, signature, h.webhookSecret) {
        http.Error(w, "Invalid signature", http.StatusUnauthorized)
        return
    }

    // Spawn goroutine for async processing
    go h.processEvent(payload)

    // Return immediately
    w.WriteHeader(http.StatusAccepted)
}
```

Key behaviors:
- Returns HTTP 202 immediately (non-blocking)
- Processes scans asynchronously in goroutines
- Includes panic recovery for resilience

### Scanner

Orchestrates the scanning pipeline:

```go
type Scanner struct {
    githubApp  *github.App
    vulnClient *vulndb.Client
    formatter  *report.Formatter
    store      ScanStore
    logger     *slog.Logger
}
```

Features:
- Parallel ecosystem scanning with `errgroup`
- 5-minute timeout on scan operations
- Graceful error handling (non-fatal errors become warnings)

### Parsers

Ecosystem-specific dependency extractors:

| Ecosystem | Parser | Primary File | Lock File |
|-----------|--------|--------------|-----------|
| Go | `go_parser.go` | go.mod | go.sum |
| npm | `npm_parser.go` | package.json | package-lock.json, yarn.lock |
| Python | `python_parser.go` | requirements.txt, pyproject.toml | poetry.lock, Pipfile.lock |
| Rust | `rust_parser.go` | Cargo.toml | Cargo.lock |
| Ruby | `ruby_parser.go` | Gemfile | Gemfile.lock |
| Java | `java_parser.go` | pom.xml | - |
| .NET | `dotnet_parser.go` | *.csproj | packages.lock.json |
| PHP | `php_parser.go` | composer.json | composer.lock |
| CocoaPods | `cocoapods_parser.go` | Podfile | Podfile.lock |

Each parser implements the `Parser` interface:

```go
type Parser interface {
    Parse(content []byte, filename string) ([]models.Dependency, error)
    Ecosystem() string
}
```

### OSV Client

Queries the Open Source Vulnerabilities database:

```go
type Client struct {
    httpClient *http.Client
    cache      *Cache
}

func (c *Client) Query(pkg models.Dependency) ([]models.Vulnerability, error) {
    // Check cache first
    if cached, ok := c.cache.Get(pkg); ok {
        return cached, nil
    }

    // Query OSV API with retry
    vulns, err := c.queryWithRetry(pkg)
    if err != nil {
        return nil, err
    }

    // Cache result
    c.cache.Set(pkg, vulns)
    return vulns, nil
}
```

Features:
- 4-hour TTL cache (in-memory)
- Exponential backoff retry (3 attempts)
- Semaphore limiting (max 10 concurrent requests)

### Reachability Analyzer

Determines if vulnerable packages are imported:

```go
type Analyzer interface {
    Analyze(files map[string][]byte, packages []string) map[string]bool
    Ecosystem() string
}
```

Each ecosystem has specialized import detection:
- **Go**: `import "pkg"` statements
- **JavaScript/TypeScript**: `require()`, `import` statements
- **Python**: `import pkg`, `from pkg import`
- **Rust**: `use crate::` statements
- **Ruby**: `require 'gem'`
- **Java**: `import pkg.Class`
- **C#**: `using Namespace`
- **PHP**: `use Namespace\Class`
- **Swift/Obj-C**: `import Module`, `#import`

### Report Formatter

Generates GitHub-flavored Markdown for Check Run output:

```go
func (f *Formatter) FormatFailure(result *models.ScanResult) *github.CheckOutput {
    return &github.CheckOutput{
        Title:   fmt.Sprintf("❌ Found %d vulnerabilities", result.VulnerabilityCount()),
        Summary: "Found 3 vulnerabilities (1 CRITICAL, 2 HIGH)...",
        Text:    "## Vulnerabilities Found\n\n| Package | Version | ...",
    }
}
```

## Data Flow

### Complete Scan Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. GitHub Webhook (PR opened/synchronized)                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Signature Validation → Spawn Goroutine → Return 202             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Create Check Run (status: in_progress)                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. Fetch dependency files from PR head branch                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. Parse dependencies (parallel per ecosystem via errgroup)         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. Query OSV API (cached, semaphore-limited, 3 retries)             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  7. Fetch source files for reachability analysis                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  8. Analyze imports to determine IsImported for each finding         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  9. Update Check Run (conclusion: success/failure/neutral)           │
└─────────────────────────────────────────────────────────────────────┘
```

## Concurrency Model

dpendx handles concurrent operations safely:

| Component | Pattern | Purpose |
|-----------|---------|---------|
| Webhook processing | Goroutines | Non-blocking HTTP responses |
| Ecosystem parsing | `errgroup.Group` | Parallel multi-ecosystem scans |
| OSV queries | Semaphore (10 max) | Rate limiting API calls |
| Cache access | `sync.RWMutex` | Thread-safe read/write |
| Panic recovery | `defer/recover` | Prevent process crashes |

## Error Handling

dpendx uses wrapped errors for context:

```go
if err := c.fetchFile(path); err != nil {
    return fmt.Errorf("failed to fetch %s: %w", path, err)
}
```

Non-fatal errors are collected as warnings and included in results without failing the scan:

```go
result.Errors = append(result.Errors, "poetry.lock not found")
```

## Next Steps

- [Learn about vulnerability scanning](/core-concepts/vulnerability-scanning)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [See how check run outcomes are determined](/core-concepts/check-run-outcomes)

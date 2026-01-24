---
sidebar_position: 5
---

# Rust

dpendx provides full support for Rust projects with Cargo.toml/Cargo.lock parsing and Rust import analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `Cargo.toml` | Manifest | Direct dependencies with version requirements |
| `Cargo.lock` | Lock | Full dependency tree with exact versions |

## Cargo.toml Parsing

dpendx extracts dependencies from multiple sections:

```toml
[package]
name = "my-project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.28", features = ["full"] }
reqwest = "0.11"

[dev-dependencies]
criterion = "0.5"

[build-dependencies]
cc = "1.0"

[target.'cfg(windows)'.dependencies]
winapi = "0.3"
```

### Dependency Types

| Section | Scanned | Description |
|---------|---------|-------------|
| `[dependencies]` | ✅ Yes | Runtime dependencies |
| `[dev-dependencies]` | ✅ Yes | Development/test dependencies |
| `[build-dependencies]` | ✅ Yes | Build script dependencies |
| `[target.*.dependencies]` | ✅ Yes | Platform-specific dependencies |

### Dependency Formats

```toml
# Simple version
serde = "1.0"

# Table format
tokio = { version = "1.28", features = ["full"] }

# Git dependency (scanned if version present)
my-crate = { git = "https://github.com/...", version = "0.1" }

# Path dependency (skipped)
local-crate = { path = "../local" }
```

## Cargo.lock Parsing

The lock file contains the exact resolved dependency tree:

```toml
[[package]]
name = "serde"
version = "1.0.164"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9e8c8cf938e98f769bc164923b06dce91cea1751522f46f8466461af04c9027d"
dependencies = [
 "serde_derive",
]

[[package]]
name = "serde_derive"
version = "1.0.164"
source = "registry+https://github.com/rust-lang/crates.io-index"
```

## Reachability Analysis

dpendx analyzes Rust source files (`*.rs`) for use statements.

### Detected Import Patterns

```rust
// Standard use
use serde::Deserialize;

// Nested use
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::TcpStream,
};

// Glob import
use std::collections::*;

// Aliased use
use serde::Serialize as Ser;

// External crate (older syntax)
extern crate serde;

// Re-exports
pub use crate::models::User;
```

### Crate Name Normalization

Rust crate names use hyphens, but imports use underscores:

| Crate Name | Import Name |
|------------|-------------|
| `serde-json` | `serde_json` |
| `tokio-util` | `tokio_util` |
| `async-trait` | `async_trait` |

dpendx automatically normalizes for matching.

### Package Matching

| Vulnerable Crate | Use Statement | Match? |
|------------------|---------------|--------|
| `serde` | `use serde::Deserialize` | ✅ Yes |
| `serde` | `use serde_json::Value` | ❌ No (different crate) |
| `tokio` | `use tokio::io` | ✅ Yes |
| `tokio` | `use tokio_util::codec` | ❌ No (different crate) |

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| hyper | 0.14.18 | RUSTSEC-2023-0034 | HIGH | **Yes** | 0.14.26 |
| regex | 1.5.4 | RUSTSEC-2022-0013 | HIGH | **Yes** | 1.5.5 |
| time | 0.1.44 | RUSTSEC-2020-0071 | MEDIUM | No | 0.2.23 |

## Remediation Commands

```bash
# Update a specific crate
cargo update -p serde

# Update all dependencies
cargo update

# Check for security advisories
cargo audit

# Fix security issues
cargo audit fix
```

## Workspace Support

dpendx scans Cargo workspaces by detecting Cargo.toml files:

```
workspace/
├── Cargo.toml           # Workspace root
├── Cargo.lock           # Shared lock file
├── crate-a/
│   └── Cargo.toml       # Workspace member
└── crate-b/
    └── Cargo.toml       # Workspace member
```

The shared Cargo.lock at the workspace root is used for all members.

## Features

Cargo features don't affect vulnerability scanning. If a crate is in your dependency tree, it's scanned regardless of which features are enabled:

```toml
[dependencies]
tokio = { version = "1.28", features = ["full"] }  # All features
tokio = { version = "1.28", features = ["rt"] }    # Minimal features
# Both are scanned identically
```

## Version Requirements

Cargo uses semantic versioning requirements:

| Requirement | Meaning |
|-------------|---------|
| `1.0` | `>=1.0.0, <2.0.0` |
| `^1.0` | Same as above (caret is default) |
| `~1.0` | `>=1.0.0, <1.1.0` |
| `=1.0.5` | Exactly 1.0.5 |
| `>=1.0, <2.0` | Range |
| `*` | Any version |

Cargo.lock resolves these to exact versions.

## RustSec Advisory Database

Rust vulnerabilities are sourced from the [RustSec Advisory Database](https://rustsec.org/), which is included in OSV:

- RUSTSEC-YYYY-NNNN format
- Maintained by the Rust security team
- Comprehensive coverage of crates.io

## Best Practices

1. **Commit Cargo.lock** - Essential for reproducible builds and accurate scanning
2. **Run `cargo audit`** - Use the official tool for additional checks
3. **Update regularly** - `cargo update` keeps dependencies current
4. **Minimize dependencies** - Fewer crates = smaller attack surface

## Troubleshooting

### Cargo.lock not found

If your project doesn't have a Cargo.lock:
- Libraries often don't commit Cargo.lock
- Run `cargo generate-lockfile` to create one
- Consider committing it for better reproducibility

### Path dependencies

Local path dependencies are skipped as they're not published crates:
```toml
my-local = { path = "../my-local" }  # Skipped
```

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

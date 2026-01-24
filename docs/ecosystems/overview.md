---
sidebar_position: 1
---

# Ecosystems Overview

dpendx supports 9 package ecosystems with automatic dependency parsing and import-level reachability analysis.

## Support Matrix

| Ecosystem | Manifest | Lock Files | Import Analysis | OSV Ecosystem |
|-----------|----------|------------|-----------------|---------------|
| [Go](/ecosystems/go) | go.mod | go.sum | ✅ | `Go` |
| [npm](/ecosystems/npm) | package.json | package-lock.json, yarn.lock | ✅ | `npm` |
| [Python](/ecosystems/python) | requirements.txt, pyproject.toml | poetry.lock, Pipfile.lock | ✅ | `PyPI` |
| [Rust](/ecosystems/rust) | Cargo.toml | Cargo.lock | ✅ | `crates.io` |
| [Ruby](/ecosystems/ruby) | Gemfile | Gemfile.lock | ✅ | `RubyGems` |
| [Java](/ecosystems/java) | pom.xml | - | ✅ | `Maven` |
| [.NET](/ecosystems/dotnet) | *.csproj | packages.lock.json | ✅ | `NuGet` |
| [PHP](/ecosystems/php) | composer.json | composer.lock | ✅ | `Packagist` |
| [CocoaPods](/ecosystems/cocoapods) | Podfile | Podfile.lock | ✅ | `CocoaPods` |

## File Detection

dpendx automatically detects ecosystems by looking for dependency files in your repository:

```
repository/
├── go.mod              → Go detected
├── go.sum
├── package.json        → npm detected
├── package-lock.json
├── requirements.txt    → Python detected
├── Cargo.toml          → Rust detected
├── Gemfile             → Ruby detected
├── pom.xml             → Java detected
├── MyApp.csproj        → .NET detected
├── composer.json       → PHP detected
└── Podfile             → CocoaPods detected
```

## Multi-Ecosystem Projects

dpendx handles projects with multiple ecosystems gracefully. A typical full-stack project might have:

```
project/
├── backend/
│   └── go.mod          → Go ecosystem
├── frontend/
│   └── package.json    → npm ecosystem
├── scripts/
│   └── requirements.txt → Python ecosystem
└── mobile/
    └── Podfile         → CocoaPods ecosystem
```

All ecosystems are scanned in parallel, and results are combined in a single report.

## Parsing Priority

When both manifest and lock files exist, dpendx prioritizes:

1. **Lock files** - Most accurate, contains exact versions and full dependency tree
2. **Manifest files** - Used when lock files don't exist

| Ecosystem | Priority Order |
|-----------|---------------|
| Go | go.sum → go.mod |
| npm | package-lock.json → yarn.lock → package.json |
| Python | poetry.lock → Pipfile.lock → pyproject.toml → requirements.txt |
| Rust | Cargo.lock → Cargo.toml |
| Ruby | Gemfile.lock → Gemfile |
| .NET | packages.lock.json → *.csproj |
| PHP | composer.lock → composer.json |
| CocoaPods | Podfile.lock → Podfile |

## Reachability Analysis Coverage

Each ecosystem has specialized import analysis:

| Ecosystem | Analyzed Files | Import Patterns |
|-----------|---------------|-----------------|
| Go | `*.go` | `import "pkg"`, grouped imports |
| npm | `*.js`, `*.ts`, `*.jsx`, `*.tsx` | `require()`, `import` |
| Python | `*.py` | `import`, `from ... import` |
| Rust | `*.rs` | `use crate::`, `extern crate` |
| Ruby | `*.rb` | `require`, `require_relative` |
| Java | `*.java` | `import pkg.Class` |
| .NET | `*.cs` | `using Namespace` |
| PHP | `*.php` | `use Namespace\Class` |
| CocoaPods | `*.swift`, `*.m`, `*.h` | `import Module`, `#import` |

## Performance by Ecosystem

Typical scan times vary by ecosystem complexity:

| Ecosystem | Avg Dependencies | Avg Scan Time |
|-----------|-----------------|---------------|
| Go | 50-100 | 2-4s |
| npm | 100-500 | 3-8s |
| Python | 30-80 | 2-4s |
| Rust | 50-150 | 2-5s |
| Ruby | 50-100 | 2-4s |
| Java | 30-100 | 2-4s |
| .NET | 30-80 | 2-4s |
| PHP | 30-80 | 2-4s |
| CocoaPods | 20-50 | 1-3s |

## Ecosystem-Specific Documentation

For detailed information on each ecosystem:

- **[Go](/ecosystems/go)** - go.mod, go.sum, and Go import analysis
- **[npm](/ecosystems/npm)** - package.json, lock files, and JS/TS imports
- **[Python](/ecosystems/python)** - requirements.txt, pyproject.toml, and Python imports
- **[Rust](/ecosystems/rust)** - Cargo.toml, Cargo.lock, and Rust use statements
- **[Ruby](/ecosystems/ruby)** - Gemfile, Gemfile.lock, and Ruby requires
- **[Java](/ecosystems/java)** - pom.xml and Java imports
- **[.NET](/ecosystems/dotnet)** - *.csproj, packages.lock.json, and C# using
- **[PHP](/ecosystems/php)** - composer.json, composer.lock, and PHP use
- **[CocoaPods](/ecosystems/cocoapods)** - Podfile, Podfile.lock, and Swift/ObjC imports

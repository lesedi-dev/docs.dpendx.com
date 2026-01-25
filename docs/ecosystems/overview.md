---
sidebar_position: 1
---

# Ecosystems Overview

dpendx scans 9 package ecosystems for vulnerabilities.

## Supported Languages

| Language | Files We Scan |
|----------|---------------|
| [Go](/ecosystems/go) | go.mod, go.sum |
| [npm](/ecosystems/npm) | package.json, package-lock.json, yarn.lock |
| [Python](/ecosystems/python) | requirements.txt, pyproject.toml, poetry.lock, Pipfile.lock |
| [Rust](/ecosystems/rust) | Cargo.toml, Cargo.lock |
| [Ruby](/ecosystems/ruby) | Gemfile, Gemfile.lock |
| [Java](/ecosystems/java) | pom.xml |
| [.NET](/ecosystems/dotnet) | *.csproj, packages.lock.json |
| [PHP](/ecosystems/php) | composer.json, composer.lock |
| [CocoaPods](/ecosystems/cocoapods) | Podfile, Podfile.lock |

## How It Works

1. dpendx detects your project's ecosystems automatically
2. Parses dependency files to find packages and versions
3. Checks each package against the OSV vulnerability database
4. Reports which vulnerable packages you're actually using in your code

## Multi-Language Projects

dpendx handles projects with multiple languages. All ecosystems are scanned in parallel and combined into a single report.

```
project/
├── backend/
│   └── go.mod          → Go scanned
├── frontend/
│   └── package.json    → npm scanned
└── scripts/
    └── requirements.txt → Python scanned
```

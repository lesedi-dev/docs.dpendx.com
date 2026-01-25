---
sidebar_position: 8
---

# .NET

dpendx scans .NET projects for dependency vulnerabilities.

## What We Scan

- `*.csproj` - Project files with PackageReference elements
- `packages.lock.json` - NuGet lock file (if enabled)

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| Newtonsoft.Json | 12.0.3 | HIGH | Yes | 13.0.1 |
| System.Text.Json | 6.0.0 | HIGH | Yes | 6.0.9 |
| Microsoft.Data.SqlClient | 4.0.0 | HIGH | No | 4.0.1 |

## How to Fix

```bash
# Update a specific package
dotnet add package Newtonsoft.Json --version 13.0.1

# Check for vulnerable packages
dotnet list package --vulnerable
```

## Tips

- Enable lock files with `<RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>` in your .csproj
- Use `dotnet list package --vulnerable` for built-in vulnerability checking
- Vulnerabilities marked "Imported: Yes" are actively used in your code

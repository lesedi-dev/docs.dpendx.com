---
sidebar_position: 8
---

# .NET

dpendx supports .NET projects with .csproj and packages.lock.json parsing, plus C# import analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `*.csproj` | Manifest | PackageReference elements with versions |
| `packages.lock.json` | Lock | Full dependency tree with resolved versions |

## .csproj Parsing

dpendx extracts PackageReference elements from project files:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="7.0.0" />
    <PackageReference Include="Serilog" Version="2.12.0" />
  </ItemGroup>

  <ItemGroup Condition="'$(Configuration)' == 'Debug'">
    <PackageReference Include="Microsoft.AspNetCore.Diagnostics" Version="2.2.0" />
  </ItemGroup>
</Project>
```

### Package Reference Formats

```xml
<!-- Standard format -->
<PackageReference Include="Newtonsoft.Json" Version="13.0.1" />

<!-- With version range -->
<PackageReference Include="Serilog" Version="[2.12.0,3.0.0)" />

<!-- Floating version -->
<PackageReference Include="NUnit" Version="3.*" />

<!-- Private assets (dev dependency) -->
<PackageReference Include="coverlet.collector" Version="3.2.0">
  <PrivateAssets>all</PrivateAssets>
</PackageReference>
```

## packages.lock.json Parsing

NuGet's lock file provides the complete dependency tree:

```json
{
  "version": 1,
  "dependencies": {
    "net7.0": {
      "Newtonsoft.Json": {
        "type": "Direct",
        "requested": "[13.0.1, )",
        "resolved": "13.0.1",
        "contentHash": "..."
      },
      "Microsoft.EntityFrameworkCore": {
        "type": "Direct",
        "requested": "[7.0.0, )",
        "resolved": "7.0.0",
        "contentHash": "...",
        "dependencies": {
          "Microsoft.EntityFrameworkCore.Abstractions": "7.0.0",
          "Microsoft.EntityFrameworkCore.Analyzers": "7.0.0"
        }
      }
    }
  }
}
```

### Enabling Lock File

To generate packages.lock.json:

```xml
<!-- In your .csproj -->
<PropertyGroup>
  <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
</PropertyGroup>
```

Then run:
```bash
dotnet restore
```

## Reachability Analysis

dpendx analyzes C# files (`*.cs`) for using statements.

### Detected Import Patterns

```csharp
// Standard using
using Newtonsoft.Json;

// Using with alias
using Json = Newtonsoft.Json.JsonConvert;

// Static using
using static System.Console;

// Global using (C# 10+)
global using Microsoft.Extensions.Logging;

// Namespace-scoped using
namespace MyApp
{
    using Serilog;
}
```

### Namespace Matching

NuGet package names map to .NET namespaces:

| NuGet Package | Namespace | Match? |
|---------------|-----------|--------|
| `Newtonsoft.Json` | `Newtonsoft.Json` | ✅ Yes |
| `Serilog` | `Serilog` | ✅ Yes |
| `Microsoft.EntityFrameworkCore` | `Microsoft.EntityFrameworkCore` | ✅ Yes |

:::note
Most NuGet packages use the same name for both the package and root namespace, making matching straightforward.
:::

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| Newtonsoft.Json | 12.0.3 | CVE-2024-21907 | HIGH | **Yes** | 13.0.1 |
| System.Text.Json | 6.0.0 | CVE-2024-21319 | HIGH | **Yes** | 6.0.9 |
| Microsoft.Data.SqlClient | 4.0.0 | CVE-2022-41064 | HIGH | No | 4.0.1 |

## Remediation Commands

```bash
# Update a specific package
dotnet add package Newtonsoft.Json --version 13.0.1

# Update all packages
dotnet outdated --upgrade

# Using Package Manager Console (Visual Studio)
Update-Package Newtonsoft.Json

# Update packages.lock.json
dotnet restore --force-evaluate
```

## Multi-Project Solutions

dpendx scans all .csproj files in a solution:

```
MySolution/
├── MySolution.sln
├── src/
│   ├── MyApp/
│   │   └── MyApp.csproj          # Scanned
│   └── MyApp.Core/
│       └── MyApp.Core.csproj     # Scanned
└── tests/
    └── MyApp.Tests/
        └── MyApp.Tests.csproj    # Scanned
```

## Central Package Management

dpendx supports Directory.Packages.props:

```xml
<!-- Directory.Packages.props -->
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="Newtonsoft.Json" Version="13.0.1" />
    <PackageVersion Include="Serilog" Version="2.12.0" />
  </ItemGroup>
</Project>
```

```xml
<!-- .csproj (no version needed) -->
<PackageReference Include="Newtonsoft.Json" />
```

## Version Ranges

NuGet uses interval notation:

| Range | Meaning |
|-------|---------|
| `13.0.1` | Exact version |
| `[13.0.1]` | Exact version (explicit) |
| `[13.0.0,14.0.0)` | >= 13.0.0 and < 14.0.0 |
| `[13.0.0,)` | >= 13.0.0 |
| `(,14.0.0)` | < 14.0.0 |
| `*` | Latest |
| `13.*` | Latest 13.x |

## Best Practices

1. **Enable lock files** - `RestorePackagesWithLockFile` for reproducibility
2. **Use central package management** - Centralize versions in Directory.Packages.props
3. **Run `dotnet list package --vulnerable`** - Built-in vulnerability check
4. **Keep runtime updated** - .NET SDK includes security fixes

## Troubleshooting

### packages.lock.json not found

If lock file doesn't exist:
```xml
<PropertyGroup>
  <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
</PropertyGroup>
```
Then `dotnet restore`.

### Conditional PackageReferences

Conditionally included packages are scanned regardless of build configuration:
```xml
<ItemGroup Condition="'$(Configuration)' == 'Debug'">
  <PackageReference Include="..." />
</ItemGroup>
```

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

---
sidebar_position: 3
---

# Reachability Analysis

Understand how dpendx determines if vulnerable packages are actually used in your code.

## What Is Reachability Analysis?

Reachability analysis answers the question: **"Is this vulnerable package actually imported in my code?"**

Traditional dependency scanners report every vulnerability in your dependency tree. But many of these packages are transitive dependencies that your code never directly uses.

dpendx goes further by analyzing your source code to determine if vulnerable packages are imported, giving you actionable risk information.

## Why It Matters

Consider this scenario:

Your `package-lock.json` includes `vulnerable-lib@1.0.0` as a transitive dependency of another package. Traditional scanners would flag this as a vulnerability.

But if your code never imports `vulnerable-lib`, the risk is significantly lower. The vulnerable code paths may never execute.

| Scenario | Traditional Scanner | dpendx |
|----------|---------------------|--------|
| Package in dependencies, used in code | ⚠️ Vulnerable | ❌ Blocks PR (Imported: Yes) |
| Package in dependencies, not used | ⚠️ Vulnerable | ⚠️ Warning only (Imported: No) |

## How It Works

### Step 1: Identify Vulnerable Packages

After querying OSV, dpendx has a list of vulnerable packages:

```
lodash@4.17.20 - CVE-2021-23337
minimist@1.2.5 - CVE-2021-44906
```

### Step 2: Fetch Source Files

dpendx fetches source files from your repository based on ecosystem:

| Ecosystem | File Extensions |
|-----------|-----------------|
| Go | `.go` |
| JavaScript/TypeScript | `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs` |
| Python | `.py` |
| Rust | `.rs` |
| Ruby | `.rb` |
| Java | `.java` |
| C# | `.cs` |
| PHP | `.php` |
| Swift/Objective-C | `.swift`, `.m`, `.h` |

### Step 3: Parse Import Statements

Each ecosystem analyzer parses import statements:

#### Go
```go
import "github.com/pkg/errors"
import (
    "fmt"
    "github.com/vulnerable/pkg"
)
```

#### JavaScript/TypeScript
```javascript
import lodash from 'lodash';
const minimist = require('minimist');
import { debounce } from 'lodash';
```

#### Python
```python
import requests
from flask import Flask
from vulnerable_pkg import something
```

#### Rust
```rust
use serde::Deserialize;
use vulnerable_crate::SomeType;
```

#### Ruby
```ruby
require 'rails'
require 'vulnerable_gem'
```

#### Java
```java
import com.google.gson.Gson;
import com.vulnerable.pkg.VulnerableClass;
```

#### C#
```csharp
using Newtonsoft.Json;
using VulnerableNamespace;
```

#### PHP
```php
use Monolog\Logger;
use Vulnerable\Package\Class;
```

#### Swift
```swift
import Alamofire
import VulnerableFramework
```

### Step 4: Match Packages to Imports

dpendx matches vulnerable package names against parsed imports:

```go
func matchPackage(packageName string, imports []string) bool {
    for _, imp := range imports {
        // Direct match
        if imp == packageName {
            return true
        }
        // Subpackage match (e.g., lodash/debounce matches lodash)
        if strings.HasPrefix(imp, packageName+"/") {
            return true
        }
    }
    return false
}
```

## Analyzer Implementation

Each ecosystem has a dedicated analyzer implementing this interface:

```go
type Analyzer interface {
    // Analyze checks if any packages are imported in the source files
    Analyze(files map[string][]byte, packages []string) map[string]bool

    // Ecosystem returns the OSV ecosystem identifier
    Ecosystem() string
}
```

### Example: JavaScript Analyzer

```go
func (a *JSAnalyzer) Analyze(files map[string][]byte, packages []string) map[string]bool {
    results := make(map[string]bool)

    // Initialize all packages as not imported
    for _, pkg := range packages {
        results[pkg] = false
    }

    // Parse each source file
    for filename, content := range files {
        imports := a.parseImports(content)

        // Check each package against imports
        for _, pkg := range packages {
            if a.matchesImport(pkg, imports) {
                results[pkg] = true
            }
        }
    }

    return results
}
```

## Import Patterns by Ecosystem

### Go
```go
// Single import
import "github.com/pkg/errors"

// Grouped imports
import (
    "fmt"
    "github.com/user/pkg"
)

// Aliased import
import errors "github.com/pkg/errors"

// Dot import
import . "github.com/pkg/errors"

// Blank import (side effects only)
import _ "github.com/lib/pq"
```

### JavaScript/TypeScript
```javascript
// ES6 imports
import pkg from 'package';
import { named } from 'package';
import * as pkg from 'package';

// CommonJS require
const pkg = require('package');
const { named } = require('package');

// Dynamic imports
const pkg = await import('package');
```

### Python
```python
# Standard import
import package

# From import
from package import module
from package.submodule import Class

# Aliased import
import package as pkg
from package import module as mod
```

## Limitations

Reachability analysis has some limitations:

### Dynamic Imports

Dynamic or computed imports cannot be statically analyzed:

```javascript
// Cannot detect
const pkg = 'lodash';
const lib = require(pkg);
```

```python
# Cannot detect
module = __import__('vulnerable_pkg')
```

### Indirect Usage

If your code uses package A, which internally uses vulnerable package B, dpendx marks B as "not imported" from your code's perspective:

```
Your code → Package A → Vulnerable Package B
                          ↑
                    "Not imported" by your code
```

### Runtime Conditions

Conditional imports based on runtime values:

```javascript
if (process.env.USE_LEGACY) {
    require('vulnerable-legacy-pkg');
}
```

### Best Practices

Despite limitations, reachability analysis significantly reduces noise by:

1. **Filtering transitive-only vulnerabilities**: Most alerts you can ignore
2. **Prioritizing direct imports**: Focus on what you actually use
3. **Reducing alert fatigue**: Fewer false positives

## ScanFinding Model

The reachability result is stored in the `ScanFinding`:

```go
type ScanFinding struct {
    Dependency    Dependency
    Vulnerability Vulnerability
    IsImported    bool  // Result of reachability analysis
}
```

This `IsImported` field determines:
- Whether the PR is blocked (any `IsImported: true` = failure)
- How the vulnerability is displayed in results

## Next Steps

- [Understand check run outcomes](/core-concepts/check-run-outcomes)
- [Explore ecosystem-specific documentation](/ecosystems/overview)
- [Learn about the OSV database](/core-concepts/osv-database)

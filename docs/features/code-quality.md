---
sidebar_position: 3
---

# Code Quality Analysis

dpendx can analyze your code for quality issues alongside vulnerability and license scanning, catching problems before they reach your main branch.

## Why Code Quality in PRs

Code review catches many issues, but some patterns are easy to miss:

- **Security anti-patterns** slip through when reviewers focus on logic
- **Complexity creep** happens gradually, one branch at a time
- **Naming inconsistencies** accumulate across contributors
- **Dead code** lingers after refactors

dpendx runs automated quality checks on every PR so reviewers can focus on design and logic.

## Analyzer Categories

dpendx includes 6 code quality analyzers, each targeting a different class of issue:

| Category | What It Detects | Severity | Example |
|----------|----------------|----------|---------|
| **security** | SQL injection, hardcoded secrets, unsafe eval, path traversal | error | `db.Query("SELECT * FROM users WHERE id=" + input)` |
| **bug** | Nil dereference, unchecked errors, race conditions | warning | `result, _ := doSomething()` (ignored error) |
| **complexity** | Functions exceeding cyclomatic complexity threshold | warning | Function with 20+ branches (default threshold: 15) |
| **naming** | Language-specific casing violations | info | `MyVariable` in Python (should be `my_variable`) |
| **duplicate** | Repeated code blocks across files | info | 10+ identical lines in two files |
| **dead_code** | Unused imports, unreachable statements | info | `import "fmt"` with no `fmt.` usage |

### Security Analyzer

Detects common security anti-patterns:

- **SQL injection** - String concatenation in SQL queries
- **Hardcoded secrets** - API keys, passwords, tokens in source code
- **Unsafe eval** - Dynamic code execution (`eval()`, `exec()`)
- **Path traversal** - Unsanitized file path construction
- **Weak crypto** - Usage of MD5, SHA1 for security purposes

### Bug Pattern Analyzer

Catches common programming mistakes:

- **Nil/null dereference** - Accessing fields on potentially nil values
- **Unchecked errors** - Ignoring return errors (Go `_` pattern)
- **Race conditions** - Concurrent map access without synchronization
- **Empty exception handlers** - Swallowing errors silently

### Complexity Analyzer

Measures cyclomatic complexity per function. High complexity correlates with bugs and makes code harder to test.

- **Default threshold:** 15
- **Configurable** via `.dpendx.yml`
- Uses Go AST for `.go` files (accurate)
- Uses regex-based counting for other languages (approximate)

### Naming Analyzer

Checks naming conventions per language:

| Language | Expected Style | Example |
|----------|---------------|---------|
| Go | `PascalCase` exports, `camelCase` unexported | `func ParseConfig()` |
| Python | `snake_case` functions/variables | `def parse_config():` |
| JavaScript/TypeScript | `camelCase` functions/variables | `function parseConfig()` |
| Rust | `snake_case` functions, `PascalCase` types | `fn parse_config()` |
| Ruby | `snake_case` methods | `def parse_config` |

### Duplicate Code Analyzer

Detects copy-pasted code using a sliding-window hash algorithm:

- Compares code blocks across all changed files
- Reports when identical blocks exceed the detection threshold
- Helps identify candidates for extraction into shared functions

### Dead Code Analyzer

Finds code that serves no purpose:

- **Unused imports** - Uses Go AST for `.go` files (accurate), regex for others
- **Unreachable code** - Statements after `return`, `break`, or `continue`

## Configuration

Code quality analysis is **disabled by default**. Enable it in your `.dpendx.yml`:

```yaml
code_quality:
  enabled: true
  naming: true
  duplicates: true
  complexity:
    enabled: true
    threshold: 15
  dead_code: true
  bug_patterns: true
  security: true
```

You can enable individual analyzers independently. For example, to only run security and bug checks:

```yaml
code_quality:
  enabled: true
  security: true
  bug_patterns: true
```

See [Configuration](./configuration) for the full `.dpendx.yml` reference.

## PR Output

When code quality issues are found, they appear in the dpendx check run report as a separate section:

```
## Code Quality

Found 4 issues (1 error, 2 warnings, 1 info)

| File | Line | Category | Severity | Message |
|------|------|----------|----------|---------|
| api/handler.go | 42 | security | error | Potential SQL injection: string concatenation in query |
| utils/parse.go | 118 | complexity | warning | Function ParseAll has cyclomatic complexity 22 (threshold: 15) |
| utils/parse.go | 15 | dead_code | info | Unused import: "strings" |
| models/user.go | 7 | naming | info | Exported function name "parse_user" should be PascalCase |
```

:::tip Severity Levels
- **error** - Security issues that should be fixed before merging
- **warning** - Bug patterns and complexity that deserve attention
- **info** - Style issues for awareness (naming, dead code, duplicates)
:::

## Limitations

- **Changed files only** - Analyzers run only on files modified in the PR, not the entire codebase
- **Regex-based for non-Go** - Complexity, dead code, and bug detection use regex patterns for languages other than Go, which can produce false positives
- **No cross-file analysis** - Each file is analyzed independently (except duplicate detection)
- **No type information** - Analysis is syntactic, not semantic (no type inference)

## Next Steps

- [Configuration](./configuration) - Full `.dpendx.yml` reference with all quality toggles
- [License Compliance](./license-compliance) - License policy checking
- [Understanding Results](/getting-started/understanding-results) - Interpret scan findings

---
sidebar_position: 3
---

# npm

dpendx provides comprehensive support for npm/Node.js projects with JavaScript and TypeScript import analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `package.json` | Manifest | Direct dependencies with version ranges |
| `package-lock.json` | Lock (npm) | Full dependency tree with exact versions |
| `yarn.lock` | Lock (Yarn) | Yarn's resolved dependency tree |

## package.json Parsing

dpendx extracts dependencies from multiple sections:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  }
}
```

### Dependency Types

| Section | Scanned | Direct |
|---------|---------|--------|
| `dependencies` | ✅ Yes | Yes |
| `devDependencies` | ✅ Yes | Yes |
| `peerDependencies` | ✅ Yes | Yes |
| `optionalDependencies` | ✅ Yes | Yes |

## Lock File Parsing

### package-lock.json

dpendx parses both lockfile v2 and v3 formats:

```json
{
  "name": "my-project",
  "lockfileVersion": 3,
  "packages": {
    "": {
      "dependencies": {
        "express": "^4.18.2"
      }
    },
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz"
    },
    "node_modules/lodash": {
      "version": "4.17.21"
    }
  }
}
```

### yarn.lock

```yaml
express@^4.18.2:
  version "4.18.2"
  resolved "https://registry.yarnpkg.com/express/-/express-4.18.2.tgz"
  dependencies:
    accepts "~1.3.8"
    body-parser "1.20.1"
```

## Reachability Analysis

dpendx analyzes JavaScript and TypeScript files for import statements.

### Analyzed File Extensions

- `.js` - JavaScript
- `.jsx` - React JavaScript
- `.ts` - TypeScript
- `.tsx` - React TypeScript
- `.mjs` - ES Modules
- `.cjs` - CommonJS Modules

### Detected Import Patterns

#### ES6 Imports

```javascript
// Default import
import express from 'express';

// Named imports
import { debounce, throttle } from 'lodash';

// Namespace import
import * as lodash from 'lodash';

// Side-effect import
import 'dotenv/config';

// Dynamic import
const lodash = await import('lodash');
```

#### CommonJS Require

```javascript
// Standard require
const express = require('express');

// Destructuring require
const { debounce } = require('lodash');

// Dynamic require path (partially detected)
const pkg = require(`./plugins/${name}`);
```

#### TypeScript Imports

```typescript
// Type-only imports (still detected)
import type { Express } from 'express';

// Import with types
import express, { Request, Response } from 'express';
```

### Package Matching

| Vulnerable Package | Import | Match? |
|--------------------|--------|--------|
| `lodash` | `lodash` | ✅ Yes |
| `lodash` | `lodash/debounce` | ✅ Yes (subpath) |
| `@babel/core` | `@babel/core` | ✅ Yes |
| `@babel/core` | `@babel/preset-env` | ❌ No (different package) |

## Scoped Packages

dpendx fully supports scoped packages (`@scope/package`):

```javascript
import { Octokit } from '@octokit/rest';
import core from '@actions/core';
```

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| lodash | 4.17.20 | CVE-2021-23337 | HIGH | **Yes** | 4.17.21 |
| minimist | 1.2.5 | CVE-2021-44906 | CRITICAL | **Yes** | 1.2.6 |
| underscore | 1.12.0 | CVE-2021-23358 | HIGH | No | 1.13.1 |

## Remediation Commands

```bash
# Upgrade a specific package
npm install lodash@4.17.21

# Upgrade all packages with vulnerabilities
npm audit fix

# Force upgrade (may have breaking changes)
npm audit fix --force

# Using yarn
yarn upgrade lodash@4.17.21
yarn audit fix
```

## Workspaces Support

dpendx scans npm/yarn workspaces by detecting package.json files in subdirectories:

```
monorepo/
├── package.json           # Root workspace
├── packages/
│   ├── core/
│   │   └── package.json   # Scanned
│   ├── cli/
│   │   └── package.json   # Scanned
│   └── web/
│       └── package.json   # Scanned
```

## Version Ranges

npm uses semver ranges that dpendx understands:

| Range | Meaning |
|-------|---------|
| `^4.17.21` | Compatible with 4.17.21 (4.17.21 to 5.0.0) |
| `~4.17.21` | Approximately 4.17.21 (4.17.21 to 4.18.0) |
| `4.17.21` | Exact version |
| `>=4.17.0` | Greater than or equal |
| `4.x` | Any 4.x.x version |
| `*` | Any version |

Lock files resolve these to exact versions for scanning.

## Best Practices

1. **Commit lock files** - Always commit `package-lock.json` or `yarn.lock`
2. **Regular audits** - Run `npm audit` or `yarn audit` periodically
3. **Update regularly** - Keep dependencies current to avoid vulnerability accumulation
4. **Minimize dependencies** - Fewer dependencies = smaller attack surface

## Troubleshooting

### Lock file out of sync

If dpendx reports different versions than expected:
```bash
# npm
rm package-lock.json && npm install

# yarn
rm yarn.lock && yarn install
```

### Module not found errors

Ensure all imports reference installed packages, not local aliases configured in bundlers.

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

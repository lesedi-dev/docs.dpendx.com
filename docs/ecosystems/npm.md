---
sidebar_position: 3
---

# npm

dpendx scans npm/Node.js projects for dependency vulnerabilities.

## What We Scan

- `package.json` - Your project dependencies
- `package-lock.json` - npm lock file
- `yarn.lock` - Yarn lock file

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| lodash | 4.17.20 | HIGH | Yes | 4.17.21 |
| minimist | 1.2.5 | CRITICAL | Yes | 1.2.6 |
| underscore | 1.12.0 | HIGH | No | 1.13.1 |

## How to Fix

```bash
# Upgrade a specific package
npm install lodash@4.17.21

# Auto-fix vulnerabilities
npm audit fix
```

## Tips

- Always commit your lock file (`package-lock.json` or `yarn.lock`)
- Run `npm audit` periodically to check for new vulnerabilities
- Vulnerabilities marked "Imported: Yes" are actively used in your code

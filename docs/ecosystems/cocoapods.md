---
sidebar_position: 10
---

# CocoaPods

dpendx scans iOS/macOS projects for dependency vulnerabilities.

## What We Scan

- `Podfile` - Your pod dependencies
- `Podfile.lock` - Locked versions

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| Alamofire | 5.4.3 | HIGH | Yes | 5.4.4 |
| SwiftyJSON | 4.3.0 | MEDIUM | Yes | 5.0.0 |
| AFNetworking | 3.2.1 | HIGH | No | 4.0.0 |

## How to Fix

```bash
# Update a specific pod
pod update Alamofire

# Update all pods
pod update

# Check for outdated pods
pod outdated
```

## Tips

- Always commit `Podfile.lock` to your repository
- Consider migrating to Swift Package Manager for new projects
- Vulnerabilities marked "Imported: Yes" are actively used in your code

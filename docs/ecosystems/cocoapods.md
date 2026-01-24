---
sidebar_position: 10
---

# CocoaPods

dpendx supports iOS/macOS projects using CocoaPods with Swift and Objective-C import analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `Podfile` | Manifest | Direct pod dependencies with version constraints |
| `Podfile.lock` | Lock | Full dependency tree with exact versions |

## Podfile Parsing

dpendx extracts pods from your Podfile:

```ruby
platform :ios, '15.0'

target 'MyApp' do
  use_frameworks!

  pod 'Alamofire', '~> 5.6'
  pod 'SwiftyJSON', '~> 5.0'
  pod 'Kingfisher', '~> 7.0'

  target 'MyAppTests' do
    inherit! :search_paths
    pod 'Quick'
    pod 'Nimble'
  end
end

target 'MyAppUITests' do
  pod 'EarlGrey'
end
```

### Targets

| Section | Scanned | Description |
|---------|---------|-------------|
| Main target | ✅ Yes | App dependencies |
| Test targets | ✅ Yes | Test framework dependencies |
| UI test targets | ✅ Yes | UI testing dependencies |

### Version Constraints

```ruby
pod 'Alamofire', '5.6.4'        # Exact version
pod 'Alamofire', '~> 5.6'       # >= 5.6.0, < 6.0.0
pod 'Alamofire', '~> 5.6.4'     # >= 5.6.4, < 5.7.0
pod 'Alamofire', '>= 5.6'       # >= 5.6.0
pod 'Alamofire', '< 6.0'        # < 6.0.0
pod 'Alamofire'                  # Latest version
```

## Podfile.lock Parsing

The lock file contains resolved dependencies:

```yaml
PODS:
  - Alamofire (5.6.4)
  - Kingfisher (7.6.2):
    - Kingfisher/Core (= 7.6.2)
  - Kingfisher/Core (7.6.2)
  - SwiftyJSON (5.0.1)

DEPENDENCIES:
  - Alamofire (~> 5.6)
  - Kingfisher (~> 7.0)
  - SwiftyJSON (~> 5.0)

SPEC CHECKSUMS:
  Alamofire: f36a35757af4587d8e4f4bfa223ad10be2422b8c
  Kingfisher: 5b92f029fab2cce44386d28ff4e9bc99b8da8ef1
  SwiftyJSON: f5b1bf1cd8dd53cd25887ac0eabcfd92301c6a5a

PODFILE CHECKSUM: 6f32c7ae8c54c0a0a0d9e1f2c3b4d5e6f7a8b9c0

COCOAPODS: 1.12.1
```

## Reachability Analysis

dpendx analyzes Swift and Objective-C files for import statements.

### Analyzed File Extensions

- `.swift` - Swift files
- `.m` - Objective-C implementation
- `.h` - Objective-C/C headers

### Swift Import Patterns

```swift
// Standard import
import Alamofire

// Framework import
import UIKit
import Foundation

// Specific symbol import
import struct Alamofire.HTTPMethod

// Testable import
@testable import MyApp
```

### Objective-C Import Patterns

```objc
// Module import
@import Alamofire;
@import UIKit;

// Header import
#import <Alamofire/Alamofire-Swift.h>
#import "MyHeader.h"

// Include
#include <stdio.h>
```

### Package Matching

| Pod | Import Statement | Match? |
|-----|------------------|--------|
| `Alamofire` | `import Alamofire` | ✅ Yes |
| `Kingfisher` | `import Kingfisher` | ✅ Yes |
| `AFNetworking` | `#import <AFNetworking/AFNetworking.h>` | ✅ Yes |

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| Alamofire | 5.4.3 | CVE-2022-40191 | HIGH | **Yes** | 5.4.4 |
| SwiftyJSON | 4.3.0 | CVE-2021-28166 | MEDIUM | **Yes** | 5.0.0 |
| AFNetworking | 3.2.1 | CVE-2020-10936 | HIGH | No | 4.0.0 |

## Remediation Commands

```bash
# Update a specific pod
pod update Alamofire

# Update all pods
pod update

# Install without updating
pod install

# Check for outdated pods
pod outdated
```

## Pod Subspecs

CocoaPods supports subspecs (modular parts of pods):

```ruby
pod 'Kingfisher/SwiftUI'
pod 'Firebase/Analytics'
pod 'Firebase/Crashlytics'
```

dpendx scans the parent pod for vulnerabilities.

## Private Pods

Private pods from custom spec repos are scanned if they have version numbers:

```ruby
source 'https://github.com/myorg/private-specs.git'
source 'https://cdn.cocoapods.org/'

pod 'MyPrivatePod', '~> 1.0'
```

## Swift Package Manager Migration

Many projects are migrating from CocoaPods to SPM. dpendx currently supports CocoaPods. SPM support is on the roadmap.

For mixed projects:
- CocoaPods dependencies in Podfile → Scanned
- SPM dependencies in Package.swift → Not yet supported

## Platform Support

dpendx scans pods for all Apple platforms:

| Platform | Podfile Syntax |
|----------|---------------|
| iOS | `platform :ios, '15.0'` |
| macOS | `platform :osx, '12.0'` |
| tvOS | `platform :tvos, '15.0'` |
| watchOS | `platform :watchos, '8.0'` |

## Best Practices

1. **Commit Podfile.lock** - Essential for reproducible builds
2. **Run `pod outdated`** - Check for available updates
3. **Update regularly** - `pod update` keeps dependencies current
4. **Consider SPM migration** - Swift Package Manager is now preferred

## Troubleshooting

### Podfile.lock not found

If lock file doesn't exist:
```bash
pod install
```

### Pod not found in analysis

If a pod's imports aren't detected:
- Check if using Objective-C bridging headers
- Verify the pod's module name (may differ from pod name)
- Umbrella frameworks may hide individual imports

### Version mismatch

If Podfile and Podfile.lock are out of sync:
```bash
pod install --repo-update
# Or to force update
rm Podfile.lock && pod install
```

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

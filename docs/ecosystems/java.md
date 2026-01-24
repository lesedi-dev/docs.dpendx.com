---
sidebar_position: 7
---

# Java

dpendx supports Java projects using Maven's pom.xml with Java import analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `pom.xml` | Manifest | Dependencies with group/artifact/version |

:::note Gradle Support
Gradle (build.gradle) is not currently supported. See the [roadmap](https://github.com/dpendx/dpendx/issues) for updates.
:::

## pom.xml Parsing

dpendx extracts dependencies from Maven's XML format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>31.1-jre</version>
        </dependency>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>5.3.23</version>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### Maven Coordinates

Dependencies are identified by GAV (Group, Artifact, Version):

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>  <!-- Group ID -->
    <artifactId>log4j-core</artifactId>           <!-- Artifact ID -->
    <version>2.17.1</version>                     <!-- Version -->
</dependency>
```

dpendx maps this to OSV's Maven ecosystem format: `org.apache.logging.log4j:log4j-core`

### Dependency Scopes

| Scope | Scanned | Description |
|-------|---------|-------------|
| `compile` (default) | ✅ Yes | Production dependencies |
| `provided` | ✅ Yes | Container-provided deps |
| `runtime` | ✅ Yes | Runtime-only deps |
| `test` | ✅ Yes | Test dependencies |
| `system` | ⚠️ Limited | Local system jars |
| `import` | ✅ Yes | BOM imports |

## Dependency Management

dpendx also parses the `dependencyManagement` section:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.7.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Reachability Analysis

dpendx analyzes Java files (`*.java`) for import statements.

### Detected Import Patterns

```java
// Single import
import com.google.common.collect.Lists;

// Wildcard import
import com.google.common.collect.*;

// Static import
import static org.junit.Assert.assertEquals;

// Static wildcard import
import static org.mockito.Mockito.*;
```

### Package Matching

Maven artifacts map to Java packages:

| Maven Artifact | Java Package | Match? |
|----------------|--------------|--------|
| `com.google.guava:guava` | `com.google.common.*` | ✅ Yes |
| `org.apache.logging.log4j:log4j-core` | `org.apache.logging.log4j.*` | ✅ Yes |
| `org.springframework:spring-core` | `org.springframework.*` | ✅ Yes |

:::note Package Mapping
Java package names often differ from Maven artifact names. dpendx uses heuristics and common mappings, but some packages may not match correctly.
:::

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| log4j-core | 2.14.1 | CVE-2021-44228 | CRITICAL | **Yes** | 2.17.1 |
| spring-core | 5.3.17 | CVE-2022-22965 | CRITICAL | **Yes** | 5.3.18 |
| jackson-databind | 2.13.2 | CVE-2022-42003 | HIGH | No | 2.13.4 |

## Remediation Commands

```xml
<!-- Update in pom.xml -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.17.1</version>  <!-- Updated version -->
</dependency>
```

```bash
# Using Maven
mvn versions:display-dependency-updates
mvn versions:use-latest-versions

# Force update dependencies
mvn dependency:resolve -U
```

## Multi-Module Projects

dpendx scans all pom.xml files in multi-module projects:

```
parent/
├── pom.xml              # Parent POM (scanned)
├── module-a/
│   └── pom.xml          # Module A (scanned)
├── module-b/
│   └── pom.xml          # Module B (scanned)
└── module-c/
    └── pom.xml          # Module C (scanned)
```

### Parent POM Properties

Version properties are resolved:

```xml
<properties>
    <spring.version>5.3.23</spring.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

## Common Vulnerabilities

Notable Java vulnerabilities detected by dpendx:

| CVE | Package | Severity | Description |
|-----|---------|----------|-------------|
| CVE-2021-44228 | log4j-core | CRITICAL | Log4Shell RCE |
| CVE-2022-22965 | spring-core | CRITICAL | Spring4Shell RCE |
| CVE-2022-42003 | jackson-databind | HIGH | DoS vulnerability |
| CVE-2017-5929 | logback-core | HIGH | Deserialization |

## Best Practices

1. **Use dependency management** - Centralize versions in parent POM
2. **Run `mvn dependency:tree`** - Understand your transitive dependencies
3. **Use OWASP plugin** - `mvn org.owasp:dependency-check-maven:check`
4. **Update regularly** - Keep dependencies current

## Troubleshooting

### Version not resolved

If a version uses a property that isn't resolved:
```xml
<version>${some.property}</version>
```

Ensure the property is defined in the same or parent pom.xml.

### Transitive dependencies

Maven doesn't have a standard lock file. Transitive dependencies are determined at build time. Consider using:
- `mvn dependency:tree` to inspect the full tree
- Maven dependency-lock plugin for reproducibility

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

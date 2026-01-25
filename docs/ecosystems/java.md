---
sidebar_position: 7
---

# Java

dpendx scans Java projects for dependency vulnerabilities.

## What We Scan

- `pom.xml` - Maven dependencies

:::note
Gradle (`build.gradle`) is not currently supported.
:::

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| log4j-core | 2.14.1 | CRITICAL | Yes | 2.17.1 |
| spring-core | 5.3.17 | CRITICAL | Yes | 5.3.18 |
| jackson-databind | 2.13.2 | HIGH | No | 2.13.4 |

## How to Fix

Update the version in your `pom.xml`:

```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.17.1</version>
</dependency>
```

Then run:
```bash
mvn dependency:resolve -U
```

## Tips

- Use `mvn versions:display-dependency-updates` to see available updates
- Centralize versions in a parent POM for multi-module projects
- Vulnerabilities marked "Imported: Yes" are actively used in your code

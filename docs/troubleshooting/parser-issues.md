---
sidebar_position: 4
---

# Parser Issues

Troubleshoot problems with dependency file parsing.

## General Parsing Issues

### File Not Detected

**Symptom:** Ecosystem not scanned even though dependency file exists.

**Causes:**
1. File name doesn't match expected pattern
2. File is in a subdirectory not scanned
3. File has wrong extension

**Solutions:**

1. **Verify file names**
   | Ecosystem | Expected Files |
   |-----------|---------------|
   | Go | `go.mod`, `go.sum` |
   | npm | `package.json`, `package-lock.json`, `yarn.lock` |
   | Python | `requirements.txt`, `pyproject.toml`, `poetry.lock` |
   | Rust | `Cargo.toml`, `Cargo.lock` |
   | Ruby | `Gemfile`, `Gemfile.lock` |
   | Java | `pom.xml` |
   | .NET | `*.csproj`, `packages.lock.json` |
   | PHP | `composer.json`, `composer.lock` |
   | CocoaPods | `Podfile`, `Podfile.lock` |

2. **Check file location**
   - Files should be in the repository root or standard locations
   - Check if files are in `.gitignore`

### File Encoding Issues

**Symptom:** Parser fails with encoding errors.

**Causes:**
1. Non-UTF-8 encoding
2. BOM (Byte Order Mark) at start of file
3. Invalid characters

**Solutions:**

```bash
# Check file encoding
file -i package.json

# Convert to UTF-8
iconv -f ISO-8859-1 -t UTF-8 package.json > package.json.utf8
mv package.json.utf8 package.json

# Remove BOM
sed -i '1s/^\xEF\xBB\xBF//' package.json
```

## Go Parser Issues

### "Invalid go.mod"

**Causes:**
1. Syntax error in go.mod
2. Unsupported directive

**Solutions:**

```bash
# Validate go.mod
go mod verify

# Tidy and format
go mod tidy
```

### "Module not in go.sum"

**Causes:**
1. go.sum is out of sync
2. New dependency added but not downloaded

**Solutions:**

```bash
# Download all dependencies
go mod download

# Update go.sum
go mod tidy
```

## npm Parser Issues

### "Invalid JSON in package.json"

**Causes:**
1. Trailing commas
2. Comments (JSON doesn't allow comments)
3. Syntax errors

**Solutions:**

```bash
# Validate JSON
cat package.json | jq .

# Fix common issues
# Remove trailing commas
# Remove comments
```

### "package-lock.json version mismatch"

**Causes:**
1. Lockfile version 1 vs 2 vs 3
2. npm version incompatibility

**Solutions:**

```bash
# Regenerate lock file
rm package-lock.json
npm install
```

### "yarn.lock parse error"

**Causes:**
1. Corrupted yarn.lock
2. Mixed yarn v1/v2 format

**Solutions:**

```bash
# Regenerate with yarn
rm yarn.lock
yarn install
```

## Python Parser Issues

### "Invalid requirements.txt"

**Causes:**
1. Invalid version specifiers
2. Unsupported line format

**Valid formats:**
```text
requests==2.28.0           # ✅ Exact version
flask>=2.0.0,<3.0.0       # ✅ Range
django~=4.2.0             # ✅ Compatible release
numpy                      # ✅ No version (latest)
-e git+https://...        # ⚠️ Skipped (editable)
https://example.com/pkg   # ⚠️ Skipped (URL)
```

**Solutions:**

```bash
# Validate format
pip check
pip freeze > requirements.txt
```

### "Invalid pyproject.toml"

**Causes:**
1. TOML syntax error
2. Missing required sections

**Solutions:**

```bash
# Validate TOML
python -c "import tomllib; tomllib.load(open('pyproject.toml', 'rb'))"

# Check Poetry format
poetry check
```

### "poetry.lock parse error"

**Causes:**
1. Lock file format changed
2. Corrupted lock file

**Solutions:**

```bash
# Regenerate lock file
rm poetry.lock
poetry lock
```

## Rust Parser Issues

### "Invalid Cargo.toml"

**Causes:**
1. TOML syntax error
2. Invalid dependency format

**Solutions:**

```bash
# Validate Cargo.toml
cargo check

# Format
cargo fmt
```

### "Cargo.lock not found"

**Note:** Libraries often don't commit Cargo.lock.

**Solutions:**

```bash
# Generate lock file
cargo generate-lockfile
```

## Ruby Parser Issues

### "Invalid Gemfile"

**Causes:**
1. Ruby syntax error
2. Invalid gem specification

**Solutions:**

```bash
# Validate Gemfile
bundle check
```

### "Gemfile.lock parse error"

**Causes:**
1. Corrupted lock file
2. Manual edits broke format

**Solutions:**

```bash
# Regenerate
rm Gemfile.lock
bundle install
```

## Java Parser Issues

### "Invalid pom.xml"

**Causes:**
1. XML syntax error
2. Invalid Maven structure

**Solutions:**

```bash
# Validate XML
xmllint --noout pom.xml

# Validate Maven project
mvn validate
```

### "Version property not resolved"

**Cause:** Version uses `${property}` that isn't defined.

**Solutions:**

```xml
<!-- Define the property -->
<properties>
    <spring.version>5.3.23</spring.version>
</properties>

<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>${spring.version}</version>  <!-- Now resolves -->
</dependency>
```

## .NET Parser Issues

### "Invalid .csproj"

**Causes:**
1. XML syntax error
2. Invalid SDK format

**Solutions:**

```bash
# Validate project
dotnet restore

# Check for errors
dotnet build --no-restore
```

### "packages.lock.json not found"

**Solution:** Enable lock file:

```xml
<PropertyGroup>
    <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
</PropertyGroup>
```

Then: `dotnet restore`

## PHP Parser Issues

### "Invalid composer.json"

**Causes:**
1. JSON syntax error
2. Invalid package format

**Solutions:**

```bash
# Validate
composer validate

# Fix autoload
composer dump-autoload
```

### "composer.lock out of sync"

**Cause:** composer.json changed without updating lock.

**Solutions:**

```bash
# Update lock file
composer update --lock
```

## CocoaPods Parser Issues

### "Invalid Podfile"

**Causes:**
1. Ruby syntax error
2. Invalid pod specification

**Solutions:**

```bash
# Validate
pod install --dry-run
```

### "Podfile.lock not found"

**Solutions:**

```bash
# Generate lock file
pod install
```

## Debugging Parser Issues

### Enable Verbose Logging

Check dpendx logs for parser details:

```bash
docker logs dpendx | grep -i "parsing\|parser"
```

### Test Parsing Locally

For each ecosystem, validate files work with their native tools:

```bash
# npm
npm install --dry-run

# Go
go mod verify

# Python
pip check

# etc.
```

## Next Steps

- [FAQ](/troubleshooting/faq)
- [Common issues](/troubleshooting/common-issues)
- [Ecosystems overview](/ecosystems/overview)

---
sidebar_position: 4
---

# Python

dpendx supports Python projects with multiple dependency file formats and Python import analysis.

## Supported Files

| File | Type | Tool | Content |
|------|------|------|---------|
| `requirements.txt` | Manifest | pip | Direct dependencies with versions |
| `pyproject.toml` | Manifest | Poetry/PEP 621 | Project metadata and dependencies |
| `poetry.lock` | Lock | Poetry | Resolved dependency tree |
| `Pipfile.lock` | Lock | Pipenv | Resolved dependency tree |

## requirements.txt Parsing

The standard pip requirements format:

```text
requests==2.28.0
flask>=2.0.0,<3.0.0
django~=4.2.0
numpy
pandas==1.5.3
-e git+https://github.com/user/repo.git#egg=mypackage
```

### Supported Formats

| Format | Example | Parsed |
|--------|---------|--------|
| Exact version | `requests==2.28.0` | ✅ Yes |
| Version range | `flask>=2.0.0,<3.0.0` | ✅ Yes (uses min) |
| Compatible release | `django~=4.2.0` | ✅ Yes |
| No version | `numpy` | ⚠️ Latest assumed |
| Editable | `-e git+...` | ❌ Skipped |
| URL | `https://...` | ❌ Skipped |
| Comments | `# comment` | Ignored |

## pyproject.toml Parsing

dpendx supports both Poetry and PEP 621 formats:

### Poetry Format

```toml
[tool.poetry]
name = "my-project"
version = "1.0.0"

[tool.poetry.dependencies]
python = "^3.9"
requests = "^2.28.0"
flask = {version = "^2.0.0", optional = true}

[tool.poetry.dev-dependencies]
pytest = "^7.0.0"
black = "^23.0.0"
```

### PEP 621 Format

```toml
[project]
name = "my-project"
version = "1.0.0"
dependencies = [
    "requests>=2.28.0",
    "flask>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
]
```

## Lock File Parsing

### poetry.lock

```toml
[[package]]
name = "requests"
version = "2.28.0"
description = "Python HTTP for Humans."
category = "main"

[package.dependencies]
certifi = ">=2017.4.17"
charset-normalizer = ">=2,<4"
idna = ">=2.5,<4"
urllib3 = ">=1.21.1,<3"

[[package]]
name = "urllib3"
version = "2.0.4"
```

### Pipfile.lock

```json
{
    "default": {
        "requests": {
            "version": "==2.28.0"
        },
        "urllib3": {
            "version": "==2.0.4"
        }
    },
    "develop": {
        "pytest": {
            "version": "==7.4.0"
        }
    }
}
```

## Reachability Analysis

dpendx analyzes Python files (`*.py`) for import statements.

### Detected Import Patterns

```python
# Standard import
import requests

# From import
from flask import Flask

# Submodule import
from requests.exceptions import HTTPError

# Aliased import
import numpy as np
from pandas import DataFrame as DF

# Multiple imports
from os import path, getcwd

# Relative imports (detected but may not match packages)
from . import utils
from ..models import User
```

### Package Name Normalization

Python package names are normalized for matching:

| Import | Normalized | Package Name |
|--------|------------|--------------|
| `import PIL` | `PIL` → `Pillow` | Pillow |
| `import cv2` | `cv2` → `opencv-python` | opencv-python |
| `import sklearn` | `sklearn` → `scikit-learn` | scikit-learn |

dpendx maintains a mapping of common import-to-package name mismatches.

### Package Matching

| Vulnerable Package | Import | Match? |
|--------------------|--------|--------|
| `requests` | `requests` | ✅ Yes |
| `requests` | `requests.exceptions` | ✅ Yes |
| `flask` | `flask` | ✅ Yes |
| `Flask` | `flask` | ✅ Yes (case-insensitive) |

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| requests | 2.25.0 | CVE-2023-32681 | MEDIUM | **Yes** | 2.31.0 |
| urllib3 | 1.26.5 | CVE-2023-43804 | HIGH | No | 1.26.18 |
| Pillow | 9.0.0 | CVE-2023-44271 | HIGH | **Yes** | 9.5.0 |

## Remediation Commands

```bash
# Using pip
pip install requests==2.31.0
pip install --upgrade requests

# Using Poetry
poetry update requests
poetry add requests@^2.31.0

# Using Pipenv
pipenv update requests
pipenv install requests==2.31.0

# Upgrade all packages
pip install --upgrade -r requirements.txt
```

## Virtual Environments

dpendx reads dependency files directly and does not interact with virtual environments. Ensure your dependency files accurately reflect your project's dependencies.

## Dependency Groups

### Poetry Groups

```toml
[tool.poetry.group.test.dependencies]
pytest = "^7.0.0"

[tool.poetry.group.docs.dependencies]
sphinx = "^6.0.0"
```

All groups are scanned.

### PEP 621 Optional Dependencies

```toml
[project.optional-dependencies]
dev = ["pytest>=7.0.0"]
docs = ["sphinx>=6.0.0"]
```

All optional dependency groups are scanned.

## Best Practices

1. **Use lock files** - poetry.lock or Pipfile.lock provide exact versions
2. **Pin versions** - Use exact versions (`==`) in production
3. **Regular updates** - Use `pip-audit` or `safety` for proactive scanning
4. **Separate dev dependencies** - Keep production dependencies minimal

## Troubleshooting

### Import name differs from package name

Some Python packages have different import names:

| Package | Import |
|---------|--------|
| Pillow | PIL |
| opencv-python | cv2 |
| scikit-learn | sklearn |
| beautifulsoup4 | bs4 |

dpendx handles common cases, but unusual packages may not match correctly.

### Version not detected

If using requirements.txt without versions:
```text
requests  # No version specified
```

dpendx cannot determine the exact version. Add version pins or use a lock file.

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

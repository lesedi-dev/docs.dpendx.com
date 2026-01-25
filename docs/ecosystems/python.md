---
sidebar_position: 4
---

# Python

dpendx scans Python projects for dependency vulnerabilities.

## What We Scan

- `requirements.txt` - pip dependencies
- `pyproject.toml` - Poetry or PEP 621 dependencies
- `poetry.lock` - Poetry lock file
- `Pipfile.lock` - Pipenv lock file

## Example Result

| Package | Version | Severity | Imported | Fix |
|---------|---------|----------|----------|-----|
| requests | 2.25.0 | MEDIUM | Yes | 2.31.0 |
| urllib3 | 1.26.5 | HIGH | No | 1.26.18 |
| Pillow | 9.0.0 | HIGH | Yes | 9.5.0 |

## How to Fix

```bash
# Using pip
pip install requests==2.31.0

# Using Poetry
poetry update requests

# Using Pipenv
pipenv update requests
```

## Tips

- Use lock files (`poetry.lock` or `Pipfile.lock`) for exact versions
- Pin versions in `requirements.txt` for production (e.g., `requests==2.31.0`)
- Vulnerabilities marked "Imported: Yes" are actively used in your code

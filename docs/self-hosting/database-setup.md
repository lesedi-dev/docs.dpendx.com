---
sidebar_position: 4
---

# Database Setup

Configure PostgreSQL for scan history persistence and analytics.

## Overview

dpendx can run with or without a database:

| Mode | Use Case |
|------|----------|
| **Without database** | Simple setup, no persistence |
| **With PostgreSQL** | Scan history, analytics, API endpoints |

## When to Use a Database

A database enables:

- **Scan history** - Store and retrieve past scan results
- **Analytics** - Track vulnerability trends over time
- **API endpoints** - Access scan data programmatically
- **Billing features** - Usage tracking for paid plans

## Supported Databases

| Database | Supported | Notes |
|----------|-----------|-------|
| PostgreSQL 14+ | ✅ Yes | Recommended |
| PostgreSQL 13 | ✅ Yes | Minimum version |
| MySQL/MariaDB | ❌ No | Not supported |
| SQLite | ❌ No | Not supported |

## Quick Setup

### Option 1: Supabase (Recommended)

[Supabase](https://supabase.com) provides free-tier PostgreSQL:

1. Create a Supabase project
2. Go to **Settings** → **Database**
3. Copy the **Connection string (URI)**
4. Set `DATABASE_URL` environment variable

```bash
DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### Option 2: Railway PostgreSQL

If deploying on Railway:

1. Add a PostgreSQL service to your project
2. Railway auto-injects `DATABASE_URL`
3. Redeploy dpendx

### Option 3: Self-Hosted PostgreSQL

```bash
# Docker
docker run -d \
  --name dpendx-postgres \
  -e POSTGRES_USER=dpendx \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=dpendx \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine
```

Connection string:
```
DATABASE_URL=postgres://dpendx:secure_password@localhost:5432/dpendx
```

## Connection String Format

```
postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=MODE
```

| Component | Description | Example |
|-----------|-------------|---------|
| USER | Database username | `dpendx` |
| PASSWORD | Database password | `secret123` |
| HOST | Database hostname | `localhost` |
| PORT | Database port | `5432` |
| DATABASE | Database name | `dpendx` |
| sslmode | SSL mode | `require` or `disable` |

### SSL Modes

| Mode | Use When |
|------|----------|
| `require` | Cloud databases (recommended) |
| `verify-full` | Maximum security |
| `disable` | Local development only |

## Database Schema

dpendx automatically creates tables on startup. No manual migration required.

### Core Tables

```sql
-- Scan reports
CREATE TABLE scan_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_owner VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    pr_number INTEGER NOT NULL,
    head_sha VARCHAR(40) NOT NULL,
    conclusion VARCHAR(20) NOT NULL,
    total_deps INTEGER NOT NULL,
    vulnerability_count INTEGER NOT NULL,
    imported_count INTEGER NOT NULL,
    ecosystems TEXT[],
    duration_ms INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_scan UNIQUE (repo_owner, repo_name, pr_number, head_sha)
);

-- Scan findings
CREATE TABLE scan_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_report_id UUID REFERENCES scan_reports(id) ON DELETE CASCADE,
    package_name VARCHAR(255) NOT NULL,
    package_version VARCHAR(100) NOT NULL,
    ecosystem VARCHAR(50) NOT NULL,
    vulnerability_id VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    is_imported BOOLEAN NOT NULL,
    fixed_version VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scan_reports_repo ON scan_reports(repo_owner, repo_name);
CREATE INDEX idx_scan_reports_created ON scan_reports(created_at);
CREATE INDEX idx_scan_findings_report ON scan_findings(scan_report_id);
```

## Configuration

### Environment Variable

Set the database URL:

```bash
DATABASE_URL=postgres://user:pass@host:5432/dpendx?sslmode=require
```

### Connection Pool

dpendx uses connection pooling with sensible defaults:

| Setting | Default | Description |
|---------|---------|-------------|
| Max connections | 25 | Maximum open connections |
| Max idle | 5 | Maximum idle connections |
| Max lifetime | 1 hour | Connection max lifetime |

### Custom Pool Settings

For high-traffic deployments, tune via URL parameters:

```bash
DATABASE_URL=postgres://user:pass@host:5432/dpendx?pool_max_conns=50&pool_max_conn_lifetime=30m
```

## Health Checks

The `/health` endpoint includes database status when configured:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "cache_size": 42,
  "uptime_seconds": 86400,
  "database": "connected"
}
```

## Backups

### Supabase

Automatic daily backups included.

### Manual Backup

```bash
pg_dump -h host -U user -d dpendx > backup.sql
```

### Restore

```bash
psql -h host -U user -d dpendx < backup.sql
```

## Monitoring

### Query Performance

Monitor slow queries:

```sql
SELECT
    query,
    calls,
    mean_exec_time,
    total_exec_time
FROM pg_stat_statements
WHERE query LIKE '%scan_reports%'
ORDER BY total_exec_time DESC
LIMIT 10;
```

### Table Sizes

```sql
SELECT
    relname AS table,
    pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

Solutions:
- Verify PostgreSQL is running
- Check host and port
- Ensure network connectivity

### Authentication Failed

```
Error: password authentication failed for user "dpendx"
```

Solutions:
- Verify username and password
- Check pg_hba.conf for allowed connections
- URL-encode special characters in password

### SSL Required

```
Error: SSL connection is required
```

Solutions:
- Add `?sslmode=require` to connection string
- For self-hosted: `?sslmode=disable` (dev only)

### Too Many Connections

```
Error: too many connections for role "dpendx"
```

Solutions:
- Reduce connection pool size
- Increase PostgreSQL max_connections
- Use connection pooling (PgBouncer)

## Data Retention

dpendx doesn't automatically delete old data. Implement retention policies:

```sql
-- Delete scans older than 90 days
DELETE FROM scan_reports
WHERE created_at < NOW() - INTERVAL '90 days';
```

Or set up a scheduled job:

```bash
# Cron job (daily at 2 AM)
0 2 * * * psql -c "DELETE FROM scan_reports WHERE created_at < NOW() - INTERVAL '90 days'"
```

## Next Steps

- [View all environment variables](/self-hosting/environment-variables)
- [Deploy with Docker](/self-hosting/deployment/docker)
- [Troubleshoot database issues](/troubleshooting/common-issues)

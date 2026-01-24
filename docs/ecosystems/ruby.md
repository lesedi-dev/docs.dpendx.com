---
sidebar_position: 6
---

# Ruby

dpendx supports Ruby projects with Bundler's Gemfile/Gemfile.lock parsing and Ruby require analysis.

## Supported Files

| File | Type | Content |
|------|------|---------|
| `Gemfile` | Manifest | Direct dependencies with version constraints |
| `Gemfile.lock` | Lock | Full dependency tree with exact versions |

## Gemfile Parsing

dpendx extracts gems from your Gemfile:

```ruby
source 'https://rubygems.org'

ruby '3.2.0'

gem 'rails', '~> 7.0.4'
gem 'pg', '>= 1.1'
gem 'puma', '~> 5.0'

group :development, :test do
  gem 'rspec-rails', '~> 6.0'
  gem 'factory_bot_rails'
end

group :development do
  gem 'web-console'
end

group :test do
  gem 'capybara'
end
```

### Dependency Groups

| Group | Scanned | Description |
|-------|---------|-------------|
| Default (no group) | ✅ Yes | Production dependencies |
| `:development` | ✅ Yes | Development tools |
| `:test` | ✅ Yes | Testing frameworks |
| `:production` | ✅ Yes | Production-only gems |
| Custom groups | ✅ Yes | All groups are scanned |

### Version Formats

```ruby
gem 'rails', '7.0.4'          # Exact version
gem 'rails', '~> 7.0.4'       # Pessimistic (~> 7.0.4 means >= 7.0.4, < 7.1.0)
gem 'rails', '>= 7.0'         # Minimum version
gem 'rails', '>= 7.0', '< 8'  # Range
gem 'rails'                    # Any version
```

## Gemfile.lock Parsing

The lock file contains resolved dependencies:

```
GEM
  remote: https://rubygems.org/
  specs:
    actioncable (7.0.4)
      actionpack (= 7.0.4)
      activesupport (= 7.0.4)
      nio4r (~> 2.0)
      websocket-driver (>= 0.6.1)
    actionpack (7.0.4)
      actionview (= 7.0.4)
      activesupport (= 7.0.4)
    rails (7.0.4)
      actioncable (= 7.0.4)
      actionpack (= 7.0.4)

PLATFORMS
  ruby
  x86_64-linux

DEPENDENCIES
  rails (~> 7.0.4)

BUNDLED WITH
   2.4.10
```

## Reachability Analysis

dpendx analyzes Ruby files (`*.rb`) for require statements.

### Detected Import Patterns

```ruby
# Standard require
require 'rails'
require 'active_record'

# Require with path
require 'nokogiri/html'

# Require relative (detected but may not match gems)
require_relative 'lib/helper'

# Bundler require
require 'bundler/setup'
Bundler.require(*Rails.groups)

# Autoload (Rails-style)
autoload :User, 'models/user'
```

### Gem Name Mapping

Ruby gems often have different require names:

| Gem Name | Require Name |
|----------|--------------|
| `activerecord` | `active_record` |
| `actionpack` | `action_pack` |
| `rspec-rails` | `rspec/rails` |
| `factory_bot` | `factory_bot` |

dpendx handles common mappings.

### Package Matching

| Vulnerable Gem | Require Statement | Match? |
|----------------|-------------------|--------|
| `nokogiri` | `require 'nokogiri'` | ✅ Yes |
| `nokogiri` | `require 'nokogiri/html'` | ✅ Yes |
| `rails` | `require 'rails'` | ✅ Yes |
| `activerecord` | `require 'active_record'` | ✅ Yes |

## Example Scan Result

| Package | Version | CVE | Severity | Imported | Fixed Version |
|---------|---------|-----|----------|----------|---------------|
| nokogiri | 1.13.6 | CVE-2022-29181 | HIGH | **Yes** | 1.13.10 |
| rack | 2.2.3 | CVE-2022-30122 | HIGH | **Yes** | 2.2.4 |
| loofah | 2.18.0 | CVE-2022-23514 | MEDIUM | No | 2.19.1 |

## Remediation Commands

```bash
# Update a specific gem
bundle update nokogiri

# Update all gems
bundle update

# Update with security patches only
bundle update --conservative

# Check for vulnerabilities
bundle audit

# Update to fix vulnerabilities
bundle audit fix
```

## Rails Projects

For Rails applications, dpendx understands the common structure:

```
rails-app/
├── Gemfile
├── Gemfile.lock
├── app/
│   ├── controllers/
│   ├── models/
│   └── views/
├── config/
└── lib/
```

All `.rb` files are scanned for imports.

## Platform-Specific Gems

Gemfile.lock may contain platform-specific variants:

```
PLATFORMS
  ruby
  x86_64-darwin-21
  x86_64-linux
```

dpendx scans all platform variants for vulnerabilities.

## Version Pessimistic Operator

The `~>` operator is common in Ruby:

| Constraint | Meaning |
|------------|---------|
| `~> 7.0.4` | `>= 7.0.4` and `< 7.1.0` |
| `~> 7.0` | `>= 7.0.0` and `< 8.0.0` |
| `~> 7` | `>= 7.0.0` and `< 8.0.0` |

## Best Practices

1. **Commit Gemfile.lock** - Essential for reproducible builds
2. **Use `bundle audit`** - Ruby's official security scanner
3. **Update regularly** - `bundle update` keeps gems current
4. **Pin production gems** - Use exact versions for stability

## Troubleshooting

### Gemfile.lock out of sync

If Gemfile and Gemfile.lock don't match:
```bash
bundle install
# Or if dependencies changed significantly
rm Gemfile.lock && bundle install
```

### Gem not found in analysis

If a gem's imports aren't detected:
- The gem may use a different require name
- Check if the gem is in the default group
- Rails autoloading may hide explicit requires

## Next Steps

- [View all supported ecosystems](/ecosystems/overview)
- [Understand reachability analysis](/core-concepts/reachability-analysis)
- [Troubleshoot parsing issues](/troubleshooting/parser-issues)

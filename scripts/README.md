# Exams Viewer Scripts

Python scripts for managing the Exams Viewer application data and operations.

## Quick Start

### Generate/Update Manifest
```bash
python3 scripts/update_manifest.py
```

### Batch Update All Exams (Optimized)
```bash
python3 scripts/servicenow_batch_scraper.py
```

### Scrape Individual Exam (with auto-manifest update)
```bash
# Basic scraping with automatic manifest update
python3 scripts/scraper.py [EXAM_CODE]

# Advanced options
python3 scripts/scraper.py CAD --force-rescan --force-update
python3 scripts/scraper.py --help  # See all options
```

## Scripts Overview

| Script | Purpose | When to Use | Auto-Manifest |
|--------|---------|-------------|---------------|
| `update_manifest.py` | Generate optimized manifest.json | After data changes, before deployment | N/A |
| `scraper.py` | Web scraping of exam questions | Adding new exams, updating content | ✅ Yes |
| `servicenow_batch_scraper.py` | Optimized batch scraping | Periodic updates, maintenance | ✅ Yes (85% faster) |

## Performance Impact

The manifest system provides significant performance improvements:
- **Initial page load**: ~90% faster
- **HTTP requests**: Reduced from 20+ to 1
- **User experience**: Instant exam listing

## Requirements
- Python 3.6+
- No external dependencies required
- Write access to `public/data/` directory

## Documentation
See [docs/scripts/SCRIPTS_DOCUMENTATION.md](../docs/scripts/SCRIPTS_DOCUMENTATION.md) for detailed documentation.

## Automation
Scripts can be integrated into CI/CD pipelines or scheduled tasks for automated maintenance.
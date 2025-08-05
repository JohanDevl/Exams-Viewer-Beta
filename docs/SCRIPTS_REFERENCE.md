# Scripts Reference - Next.js Exams Viewer

> **Python data management scripts for the modern Next.js architecture**

Quick reference guide for Python scripts that manage exam data, generate optimized manifests, and maintain the data pipeline for the Next.js application.

## 🏗️ Architecture Integration

The Python scripts integrate with Next.js by:
- **Static Data Generation** - Creating optimized JSON files for Next.js consumption
- **Build-time Integration** - Scripts run during deployment to update data
- **Public Directory Management** - Scripts populate `/public/data/` for Next.js static serving
- **Manifest Optimization** - Generate compressed metadata for fast initial loads
- **GitHub Actions Integration** - Automated data updates via workflows

## 🚀 Essential Commands

### Quick Operations

```bash
# Update manifest (most common operation)
python3 scripts/update_manifest.py

# RECOMMENDED: Optimized ServiceNow batch scraping
python3 scripts/servicenow_batch_scraper.py

# Update specific exam (optimized)
python3 scripts/servicenow_batch_scraper.py --exam CAD

# Legacy: Full system update
python3 scripts/update_all_exams.py

# Individual exam scraping (legacy)
python3 scripts/scraper.py [EXAM_CODE]

# Check deployment-ready manifest
ls -la public/data/manifest.json && python3 -m json.tool public/data/manifest.json | head -20
```

### Next.js Integration Commands

```bash
# Pre-deployment data refresh (optimized)
python3 scripts/servicenow_batch_scraper.py && npm run build

# Development data update
python3 scripts/update_manifest.py && npm run dev

# Production deployment preparation (optimized)
python3 scripts/servicenow_batch_scraper.py --force-update
git add public/data/
git commit -m "data: update exam data for Next.js deployment"
```

## 📊 Data Structure for Next.js

### Public Directory Layout

```
public/data/                    # Next.js static assets
├── manifest.json              # Optimized metadata (SSG ready)
├── CAD/                       # Individual exam data
│   ├── exam.json             # Questions and answers
│   └── links.json            # Scraping metadata
├── CSA/
│   ├── exam.json
│   └── links.json
└── ...                       # 20+ exam directories
```

### Manifest Structure

```json
{
  "version": "4.0.0",
  "generated": "2024-01-04T10:30:00.000Z",
  "totalExams": 20,
  "totalQuestions": 3000,
  "nextjs": {
    "buildTime": "2024-01-04T10:30:00.000Z",
    "dataPath": "/data",
    "staticGeneration": true
  },
  "exams": [
    {
      "code": "CAD",
      "name": "Certified Application Developer",
      "description": "ServiceNow Certified Application Developer",
      "questionCount": 150,
      "lastUpdated": "2024-01-04T09:15:00.000Z",
      "dataUrl": "/data/CAD/exam.json",
      "size": "245KB",
      "status": "complete"
    }
  ]
}
```

## 🔧 Script Details

### 1. servicenow_batch_scraper.py (Recommended)

**Purpose**: Optimized ServiceNow batch scraping with 85% fewer requests
**Next.js Integration**: Ultra-fast data collection for static generation

```bash
# Optimized batch scraping (recommended)
python3 scripts/servicenow_batch_scraper.py

# Links collection only
python3 scripts/servicenow_batch_scraper.py --links-only

# Questions processing only
python3 scripts/servicenow_batch_scraper.py --questions-only

# Update specific exam
python3 scripts/servicenow_batch_scraper.py --exam CAD

# Force complete refresh
python3 scripts/servicenow_batch_scraper.py --force-update
```

**Key Features**:
- ✅ **85% fewer server requests** (1 pass vs 20 passes)
- ✅ **75% faster collection** (15-20 min vs 60-90 min)
- ✅ Manifest-based targeting of ServiceNow exams
- ✅ Automatic manifest generation
- ✅ Respectful rate limiting
- ✅ Next.js build optimization

### 2. update_all_exams.py (Legacy)

**Purpose**: Traditional exam data management (use servicenow_batch_scraper.py instead)
**Status**: Maintained for backward compatibility

```bash
# Legacy batch update
python3 scripts/update_all_exams.py

# Update specific exam
python3 scripts/update_all_exams.py --exam CAD

# Force complete refresh (for deployments)
python3 scripts/update_all_exams.py --force-rescan --force-update
```

**Note**: Use `servicenow_batch_scraper.py` for significantly better performance.

### 3. update_manifest.py

**Purpose**: Generate optimized manifest.json for Next.js
**Next.js Integration**: Creates metadata for getStaticProps and client-side loading

```bash
# Generate optimized manifest
python3 scripts/update_manifest.py

# Verify manifest structure
python3 scripts/update_manifest.py --validate

# Development mode with detailed output
DEBUG=true python3 scripts/update_manifest.py
```

**Output Optimization**:
- 🚀 **6KB compressed** vs 200KB+ raw data
- ⚡ **Single HTTP request** for all exam metadata
- 📱 **Mobile optimized** with gzip compression
- 🎯 **SSG compatible** with Next.js static generation

### 4. scraper.py (Legacy)

**Purpose**: Individual exam scraping (use update_all_exams.py instead)
**Status**: Maintained for backward compatibility

```bash
# Legacy individual exam scraping
python3 scripts/scraper.py CAD
```

**Note**: Use `update_all_exams.py --exam CAD` for better Next.js integration.

## 🔄 GitHub Actions Integration

### Manual Workflow Trigger (Optimized)

1. **Navigate to Actions tab** on GitHub repository
2. **Select "ServiceNow Data Update (Optimized)"** workflow
3. **Configure options**:
   - `force_rescan`: Force rescan of all ServiceNow links
   - `force_update`: Update existing ServiceNow questions with 3-tier extraction
   - `specific_exam`: Target specific ServiceNow exam (leave empty for all exams)
4. **Click "Run workflow"**

**Performance Benefits:**
- ⚡ **85% fewer server requests** (single pass vs multiple passes)
- 🚀 **75% faster completion** (15-20 min vs 60-90 min for links)
- 🎯 **Manifest-based targeting** (ServiceNow exams from manifest)
- 🛡️ **Respectful rate limiting** with automatic delays

### Workflow Configuration (Updated for ServiceNow Optimization)

```yaml
# .github/workflows/manual-update.yml
name: ServiceNow Data Update (Optimized)

on:
  workflow_dispatch:
    inputs:
      force_rescan:
        description: 'Force rescan of all ServiceNow links (ignores existing complete status)'
        required: false
        default: false
        type: boolean
      force_update:
        description: 'Force update of existing ServiceNow questions with improved scraper logic'
        required: false
        default: true
        type: boolean
      specific_exam:
        description: 'Update only a specific ServiceNow exam code (leave empty for all exams)'
        required: false
        default: ''
        type: string

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: pip install -r requirements.txt
        
      - name: Update ServiceNow exam data (Optimized)
        run: |
          echo "🚀 Starting optimized ServiceNow batch data update..."
          echo "🎯 Targeting: ServiceNow exams from manifest (85% fewer requests)"
          
          COMMAND="python scripts/servicenow_batch_scraper.py"
          
          if [ "${{ github.event.inputs.force_rescan }}" == "true" ]; then
            COMMAND="$COMMAND --force-rescan"
          fi
          
          if [ "${{ github.event.inputs.force_update }}" == "true" ]; then
            COMMAND="$COMMAND --force-update"
          fi
          
          if [ -n "${{ github.event.inputs.specific_exam }}" ]; then
            COMMAND="$COMMAND --exam ${{ github.event.inputs.specific_exam }}"
          fi
          
          $COMMAND
            
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/data/
          git commit -m "🚀 ServiceNow data update

          - Updated ServiceNow exam questions and answers
          - Timestamp: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
          - Triggered manually via GitHub Actions"
          git push
```

## 📈 Performance Optimizations

### Before Script Optimization
- 🐌 **20+ HTTP requests** on initial page load
- ⏳ **Progressive loading** with loading states
- 📡 **200KB+** initial data transfer
- 🔄 **Client-side data fetching** with loading delays

### After Script Optimization
- ⚡ **1 HTTP request** for manifest (6KB)
- 🚀 **Instant display** of all exam information
- 📱 **Mobile optimized** with better performance
- 🎯 **Lazy loading** of selected exams only
- 🏗️ **SSG compatible** with Next.js static generation

### Build Performance Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Initial Load** | 2.3s | 0.8s | **65% faster** |
| **Data Requests** | 20+ | 1 | **95% reduction** |
| **Bundle Size** | 200KB+ | 6KB | **97% smaller** |
| **Time to Interactive** | 3.1s | 1.2s | **61% faster** |

## 🐛 Troubleshooting

### Common Issues

#### Permission Errors
```bash
# Fix script permissions
chmod +x scripts/*.py

# Check Python path
which python3
python3 --version
```

#### Data Validation Errors
```bash
# Validate manifest structure
python3 -m json.tool public/data/manifest.json

# Check exam data integrity
find public/data -name "exam.json" -exec python3 -m json.tool {} \; > /dev/null

# Verify Next.js can access data
ls -la public/data/manifest.json
curl -s http://localhost:3000/data/manifest.json | jq .
```

#### Missing Dependencies
```bash
# Install Python requirements
pip install -r requirements.txt

# Verify required packages
python3 -c "import requests, json, pathlib; print('Dependencies OK')"
```

#### Rate Limiting Issues
```bash
# Use longer delays between requests
python3 scripts/update_all_exams.py --delay 10

# Check current rate limiting status
python3 scripts/update_all_exams.py --check-limits
```

### Next.js Integration Issues

#### Build Failures
```bash
# Ensure data is ready before build
python3 scripts/update_manifest.py
npm run build

# Check static generation
npm run build 2>&1 | grep -i "static"
```

#### Development Server Issues
```bash
# Restart dev server after data updates
npm run dev

# Check data accessibility
curl http://localhost:3000/data/manifest.json
```

## 🔄 Development Workflow

### Daily Development
```bash
# Start development with fresh data
python3 scripts/update_manifest.py
npm run dev

# Hot reload continues to work with static data
# No need to restart for exam data changes
```

### Pre-deployment Checklist
```bash
# 1. Update all exam data
python3 scripts/update_all_exams.py --force-update

# 2. Verify manifest generation
python3 scripts/update_manifest.py --validate

# 3. Test Next.js build
npm run build

# 4. Verify static files
ls -la public/data/manifest.json
du -h public/data/

# 5. Commit changes
git add public/data/
git commit -m "data: update exam data for deployment"
```

### Automated Deployment
```bash
# GitHub Actions handles this automatically
# Manual trigger available in Actions tab
# Automatically commits updated data files
```

## 📚 Advanced Usage

### Development Testing
```bash
# Test manifest generation without saving
python3 -c "
from scripts.update_manifest import generate_manifest
manifest = generate_manifest()
print(f'Generated manifest with {len(manifest[\"exams\"])} exams')
print(f'Total questions: {manifest[\"totalQuestions\"]}')
"

# Validate specific exam data
python3 -c "
import json
with open('public/data/CAD/exam.json') as f:
    data = json.load(f)
print(f'CAD exam: {len(data[\"questions\"])} questions')
"
```

### Batch Operations
```bash
# Update multiple specific exams
for exam in CAD CSA CIS-ITSM; do
  python3 scripts/update_all_exams.py --exam $exam
done

# Update manifest after batch operations
python3 scripts/update_manifest.py
```

### Performance Monitoring
```bash
# Monitor script performance
time python3 scripts/update_all_exams.py

# Check data sizes
find public/data -name "*.json" -exec du -h {} \; | sort -h

# Validate Next.js integration
npm run build -- --debug
```

## 🚀 Next.js Deployment Integration

### Vercel Deployment
The scripts integrate seamlessly with Vercel:
- Pre-build data updates via GitHub Actions
- Static file serving from `/public/data/`
- Automatic CDN optimization
- Build-time manifest generation

### Self-hosted Deployment
```bash
# Docker integration
COPY scripts/ ./scripts/
COPY requirements.txt ./
RUN pip install -r requirements.txt
RUN python3 scripts/update_all_exams.py

# Nginx serving
location /data/ {
  root /var/www/html/public;
  expires 1h;
  add_header Cache-Control "public, immutable";
}
```

---

**The scripts are optimized for Next.js static generation, providing fast data loading and excellent developer experience with modern deployment workflows.**
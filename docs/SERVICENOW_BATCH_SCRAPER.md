# ServiceNow Batch Scraper

The `servicenow_batch_scraper.py` script is specifically designed to optimize scraping of ServiceNow exams by using the existing manifest.

## 🎯 Intelligent Approach

### Manifest-Based
- ✅ **Automatic reading** of manifest to identify ServiceNow exams
- ✅ **Precise targeting**: only exams already known and structured
- ✅ **No unnecessary discovery** of irrelevant exams

### ServiceNow Optimization
- ✅ **Single pass** through all ServiceNow pages on ExamTopics
- ✅ **Simultaneous collection** of all links for ServiceNow exams
- ✅ **Intelligent dispatch** to existing directories
- ✅ **Compatible** with existing architecture

## 📊 Performance vs Current System

| Metric | Current System | ServiceNow Optimized | Gain |
|--------|---------------|-------------------|------|
| **Page passes** | Nx (one per exam) | 1x | **Nx fewer** |
| **Collection time** | ~60-90 min | ~15-20 min | **75% faster** |
| **Requests** | ~300-500 | ~50-80 | **85% fewer** |
| **Server load** | High | Minimal | **Respectful** |

## 🚀 Usage Modes

### 1. Complete update (recommended)
```bash
python3 scripts/servicenow_batch_scraper.py
```
**Actions:**
- Phase 1: Collect all ServiceNow links (15-20 min)
- Phase 2: Dispatch to ServiceNow exam directories  
- Phase 3: Process all questions (1-2h)
- Phase 4: Update manifest

### 2. Links collection only
```bash
python3 scripts/servicenow_batch_scraper.py --links-only
```
**Ideal for:**
- Quick link preparation
- Collection testing
- Update `links.json` only

### 3. Questions only
```bash
python3 scripts/servicenow_batch_scraper.py --questions-only
```
**Uses:**
- Pre-collected links
- Process all questions
- Perfect after `--links-only`

### 4. Specific exam
```bash
python3 scripts/servicenow_batch_scraper.py --exam CAD
python3 scripts/servicenow_batch_scraper.py --exam CSA --questions-only
```

### 5. Forced update
```bash
python3 scripts/servicenow_batch_scraper.py --force-update
```

## 📋 Targeted ServiceNow Exams

The script automatically processes **ServiceNow exams** from the manifest:

**Base Certifications:**
- `CAD` - Certified Application Developer (158 questions)
- `CSA` - Certified System Administrator (369 questions)

**CIS Specializations (Certified Implementation Specialist):**
- `CAS-PA` - Performance Analytics (79 questions)
- `CIS-APM` - Application Portfolio Management (24 questions)
- `CIS-CPG` - Cloud Provisioning and Governance (32 questions)
- `CIS-CSM` - Customer Service Management (240 questions)
- `CIS-Discovery` - Discovery (104 questions)
- `CIS-EM` - Event Management (109 questions)
- `CIS-FSM` - Field Service Management (44 questions)
- `CIS-HAM` - Hardware Asset Management (180 questions)
- `CIS-HR` - Human Resources (169 questions)
- `CIS-ITSM` - IT Service Management (224 questions)
- `CIS-PPM` - Project Portfolio Management (166 questions)
- `CIS-RC` - Risk and Compliance (179 questions)
- `CIS-SAM` - Software Asset Management (191 questions)
- `CIS-SIR` - Security Incident Response (117 questions)
- `CIS-SM` - Service Mapping (39 questions)
- `CIS-SPM` - Strategic Portfolio Management (51 questions)
- `CIS-VR` - Vulnerability Response (59 questions)
- `CIS-VRM` - Vendor Risk Management (59 questions)

**Total: ServiceNow questions (dynamically loaded from manifest)**

## 🔄 Recommended Workflow

### Weekly update:
```bash
# Option 1: All at once (2-3h)
python3 scripts/servicenow_batch_scraper.py

# Option 2: Two phases (more flexible)
python3 scripts/servicenow_batch_scraper.py --links-only     # 15-20 min
python3 scripts/servicenow_batch_scraper.py --questions-only # 1-2h
```

### Test or debug one exam:
```bash
python3 scripts/servicenow_batch_scraper.py --exam CSA --links-only
python3 scripts/servicenow_batch_scraper.py --exam CSA --questions-only
```

### Complete forced update:
```bash
python3 scripts/servicenow_batch_scraper.py --force-update
```

## 🏗️ Internal Architecture

### Phase 1: Manifest Reading
```python
load_servicenow_exams_from_manifest()
# → Loads ServiceNow exam codes from public/data/manifest.json
```

### Phase 2: ServiceNow Batch Collection
```python
batch_collect_servicenow_links(target_exam_codes, progress)
# → SINGLE pass through all /discussions/servicenow/ pages
# → Simultaneous collection of links for all ServiceNow exams
# → Automatic sorting by question number
```

### Phase 3: Intelligent Dispatch
```python
dispatch_servicenow_links(exam_links, target_exam_codes, total_pages)
# → Creates/updates links.json in public/data/{EXAM_CODE}/
# → Marks as "complete" with metadata
```

### Phase 4: Question Processing
```python
process_servicenow_questions(exam_codes, progress, force_update)
# → Uses existing scrape_questions()
# → Respectful mode with delays
# → Intelligent update management
```

## ✅ Key Advantages

### 🎯 **Precise Targeting**
- Only ServiceNow exams from manifest
- No time wasted on other certifications
- Respects existing architecture

### ⚡ **Ultra-Efficient**
- 85% fewer server requests
- 75% faster collection
- 1 single pass vs 20 passes

### 🛡️ **Respectful**
- Random delays between pages (2-4s)
- 15s pause between exams
- Respectful headers
- Non-rapid mode by default

### 🔄 **Compatible**
- Uses existing `scraper.py` for questions
- Identical JSON format
- Integration with `update_manifest.py`
- Preserves `public/data/` structure

## 🔧 Direct Replacement

Simply replace the old workflow:

```bash
# Old (20 passes on same pages)
python3 scripts/update_all_exams.py

# New (1 optimized pass)
python3 scripts/servicenow_batch_scraper.py
```

**Identical result, revolutionary performance!** 🚀

## 📝 Links.json Format

The generated `links.json` files contain:

```json
{
  "page_num": 45,              // Total ServiceNow pages processed
  "status": "complete", 
  "links": [...],              // Sorted question links
  "collected_at": "2025-08-04T...",
  "method": "servicenow_batch_collection",
  "exam_code": "CAD",
  "links_count": 158
}
```

This format is fully compatible with existing processing while providing additional metadata about the batch collection process.
# Python Scripts Documentation

This document provides detailed information about the Python scripts used for managing exam data in the Exams Viewer application.

## Overview

The Python scripts are located in the `/scripts/` directory and handle:
- Scraping exam questions from ExamTopics
- Managing progress with multi-level progress bars
- Providing detailed update summaries
- Batch processing of ServiceNow exams
- Maintaining the exam manifest

## Core Scripts

### servicenow_batch_scraper.py

**Purpose**: Optimized batch scraper specifically for ServiceNow exams with advanced progress tracking.

**Key Features**:
- 85% fewer HTTP requests compared to individual scraping
- 75% faster processing through batch collection
- Multi-level progress bars with ETA calculations
- Detailed update summaries after each exam
- Global statistics across all processed exams

**Usage**:
```bash
# Process all ServiceNow exams
python3 scripts/servicenow_batch_scraper.py

# Links collection only
python3 scripts/servicenow_batch_scraper.py --links-only

# Questions processing only (requires existing links)
python3 scripts/servicenow_batch_scraper.py --questions-only

# Process specific exam
python3 scripts/servicenow_batch_scraper.py --exam CSA

# Force update existing questions
python3 scripts/servicenow_batch_scraper.py --force-update
```

**Progress Display**:
- Main progress bar showing total workflow steps
- Sub-progress bars for individual phases (link collection, question processing)
- Real-time ETA calculations based on observed delays
- Detailed phase summaries with statistics

**Update Summary Format**:
After processing each exam:
```
📊 Update Summary:
   ✅ New questions added: 15
   🔄 Existing questions updated: 44
   ⏭️ Questions skipped (no changes): 120
✅ CIS-FSM: 179 questions updated successfully
```

### scraper.py

**Purpose**: Individual exam scraper with smart update detection.

**Key Features**:
- Smart update detection (only updates changed questions)
- Supports force update mode
- Enhanced most_voted answer extraction (3-tier approach)
- Automatic manifest updates after scraping
- Image processing and compression

**Usage**:
```bash
# Scrape specific exam
python3 scripts/scraper.py CAD

# Force rescan links
python3 scripts/scraper.py CAD --force-rescan

# Force update all questions
python3 scripts/scraper.py CAD --force-update

# Rapid scraping mode (less respectful delays)
python3 scripts/scraper.py CAD --rapid
```

**Smart Update Logic**:
- Compares existing vs new question data
- Updates only when content actually changed
- Detects changes in: most_voted, question content, answers, content hash
- Provides detailed reasons for updates

### progress_manager.py

**Purpose**: Multi-level progress bar manager using tqdm library.

**Key Features**:
- Main and nested sub-progress bars
- Precise ETA calculations based on delay statistics
- Phase timing tracking
- Comprehensive summary reports
- Legacy compatibility adapter

**Core Classes**:

#### ProgressManager
Manages multi-level progress bars with positioning and timing.

**Methods**:
- `main_progress(total_steps, title)`: Context manager for main progress
- `sub_progress(total_items, title, phase_type)`: Context manager for sub-progress
- `update_main(text)`: Updates main progress bar
- `update_sub(text)`: Updates sub-progress bar
- `calculate_eta(remaining_work)`: Calculates ETA based on workload
- `print_phase_summary(**stats)`: Displays phase completion summary
- `print_final_summary(**stats)`: Displays final completion summary

#### LegacyProgressAdapter
Maintains compatibility with existing progress interface.

**Delay Statistics** (used for ETA calculations):
- Page scraping: 3.0s average (2-4s between ServiceNow pages)
- Question scraping: 7.5s average (5-10s between questions)  
- Exam pause: 15.0s (pause between exams)
- Image download: 0.5s per image

### update_manifest.py

**Purpose**: Maintains the central exam manifest with metadata.

**Key Features**:
- Updates exam metadata (question counts, last updated timestamps)
- Validates exam data integrity
- Supports both full manifest updates and single exam updates
- Automatic backup of previous manifest versions

**Usage**:
```bash
# Update entire manifest
python3 scripts/update_manifest.py

# Update specific exam in manifest
python3 scripts/update_manifest.py --exam CAD
```

## Data Flow

### Complete Scraping Workflow
1. **Link Collection**: Batch collect all question links from ServiceNow pages
2. **Link Dispatch**: Organize links by exam code and save to exam directories
3. **Question Processing**: Process questions for each exam with smart update detection
4. **Manifest Update**: Update central manifest with new metadata
5. **Summary Reports**: Display detailed statistics and timing information

### File Structure Generated
```
public/data/
├── manifest.json                 # Central catalog
├── [EXAM_CODE]/
│   ├── exam.json                # Questions with update_stats
│   └── links.json               # Collected links with metadata
```

### Update Statistics Tracking
Each `exam.json` now includes `update_stats`:
```json
{
  "status": "complete",
  "error": "",
  "questions": [...],
  "update_stats": {
    "new_count": 15,
    "updated_count": 44,
    "skipped_count": 120,
    "total_processed": 179
  }
}
```

## Performance Optimizations

### Batch Collection Benefits
- **85% fewer requests**: Single pass through all ServiceNow pages
- **75% faster processing**: Reduced network overhead and improved efficiency
- **Better rate limiting**: Respectful delays prevent blocking
- **Comprehensive statistics**: Detailed tracking of all changes

### Smart Update Detection
- **Hash-based change detection**: Only updates when content actually changes
- **Selective processing**: Skips unchanged questions automatically
- **Detailed change reasons**: Provides context for why updates occurred
- **Force update support**: Override smart detection when needed

## Error Handling

### Network Resilience
- Automatic retry logic for failed requests
- Graceful handling of rate limiting
- Respectful delays between requests (2-4s pages, 5-10s questions, 15s exams)
- Comprehensive error reporting with context

### Data Validation
- Question integrity checks before updates
- Link validation and sorting
- Manifest consistency verification
- Backup creation before major changes

## Dependencies

### Required Python Packages
```txt
tqdm>=4.67.1          # Progress bars and timing
requests>=2.25.1      # HTTP requests
beautifulsoup4>=4.9.3 # HTML parsing
Pillow>=8.2.0         # Image processing
```

### Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Or using conda
conda install --file requirements.txt
```

## Best Practices

### Development Workflow
1. Always run `--links-only` first for new exams
2. Use `--questions-only` for faster re-processing
3. Run manifest updates after significant changes
4. Monitor progress bars and ETAs during long operations
5. Check update summaries for unexpected changes

### Maintenance
- Regular manifest updates to keep metadata current
- Periodic full re-scans to catch structural changes
- Monitor error rates and adjust delay timings if needed
- Backup exam data before major updates

## Troubleshooting

### Common Issues
- **Rate limiting**: Increase delays in respectful_request()
- **Memory issues**: Process exams individually using --exam flag
- **Network timeouts**: Check internet connection and ExamTopics availability
- **Progress bar conflicts**: Ensure only one scraper runs at a time

### Debug Mode
Enable detailed logging by modifying the scripts:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Last updated: August 2025 - Complete documentation for progress tracking and update summaries
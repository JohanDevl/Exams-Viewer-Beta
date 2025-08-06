# Progress Tracking System Documentation

This document provides technical details about the multi-level progress tracking system implemented for ServiceNow exam scraping.

## Overview

The progress tracking system uses the `tqdm` library to provide:
- **Multi-level progress bars**: Main workflow progress with nested sub-progress for individual phases
- **Precise ETA calculations**: Based on observed delay statistics and real-time performance
- **Comprehensive reporting**: Phase summaries and final statistics
- **Legacy compatibility**: Adapter pattern for existing progress interfaces

## Architecture

### Core Components

#### ProgressManager Class
Central manager for all progress tracking operations.

**Key Attributes**:
```python
class ProgressManager:
    main_bar: tqdm           # Main workflow progress bar
    current_sub_bar: tqdm    # Current sub-progress bar
    phase_timings: dict      # Timing data for each phase
    delay_stats: dict        # Statistical delay averages
    main_position: int = 0   # Main bar position (top)
    sub_position: int = 1    # Sub-bar position (below main)
```

#### Context Managers

**Main Progress Context**:
```python
with progress_manager.main_progress(total_steps, title):
    # Main workflow operations
    progress_manager.update_main("Phase completed")
```

**Sub Progress Context**:
```python
with progress_manager.sub_progress(total_items, title, phase_type):
    # Individual phase operations
    progress_manager.update_sub("Item processed")
```

### Progress Bar Positioning

The system uses `tqdm`'s position parameter for proper nested display:

```
🚀 ServiceNow Batch Scraper ████████████████ 3/4 steps
📄 Processing CSA questions ████████████████ 150/371 items
```

- **Position 0**: Main progress bar (persistent, stays visible)
- **Position 1**: Sub-progress bar (temporary, disappears when complete)

## ETA Calculation System

### Delay Statistics

Based on analysis of ExamTopics scraping patterns:

```python
delay_stats = {
    'page_scraping': 3.0,        # 2-4s between ServiceNow pages
    'question_scraping': 7.5,    # 5-10s between questions
    'exam_pause': 15.0,          # 15s between exams
    'image_download': 0.5        # 0.5s per image
}
```

### ETA Calculation Logic

```python
def calculate_eta(self, remaining_work: Dict[str, int]) -> str:
    total_seconds = 0
    total_seconds += remaining_work.get('pages', 0) * self.delay_stats['page_scraping']
    total_seconds += remaining_work.get('questions', 0) * self.delay_stats['question_scraping']
    total_seconds += remaining_work.get('exams', 0) * self.delay_stats['exam_pause']
    total_seconds += remaining_work.get('images', 0) * self.delay_stats['image_download']
    return self._format_time(total_seconds)
```

### Adaptive ETA

The system can adapt ETA calculations based on observed performance:

```python
def calculate_phase_eta(self, phase_type: str, items_remaining: int, items_total: int) -> str:
    if phase_type in self.phase_timings and items_total > 0:
        # Use observed performance from this session
        avg_time_per_item = self.phase_timings[phase_type] / (items_total - items_remaining)
        eta_seconds = avg_time_per_item * items_remaining
    else:
        # Use default statistics
        eta_seconds = items_remaining * self.delay_stats[phase_type]
    return self._format_time(eta_seconds)
```

## Integration with ServiceNow Scraper

### Workflow Phases

The ServiceNow batch scraper integrates progress tracking across multiple phases:

1. **Link Collection Phase**
   ```python
   with progress_manager.sub_progress(num_pages, "Collecting links from ServiceNow pages", "link_collection"):
       for page_num in range(1, num_pages + 1):
           # Process page
           progress_manager.update_sub(f"Page {page_num}/{num_pages} - {links_found} links found")
   ```

2. **Link Dispatch Phase**
   ```python
   with progress_manager.sub_progress(len(exam_codes), "Dispatching links by exam", "link_dispatch"):
       for exam_code in exam_codes:
           # Dispatch links
           progress_manager.update_sub(f"✅ {exam_code}: {len(links)} links dispatched")
   ```

3. **Question Processing Phase**
   ```python
   with progress_manager.sub_progress(len(questions), f"Exam {exam_code} questions", "question_processing"):
       for question_link in question_links:
           # Process question
           progress_manager.update_sub(f"Question {i+1}/{total} - Processing...")
   ```

### Main Progress Updates

```python
with progress_manager.main_progress(total_steps, "ServiceNow Batch Scraping"):
    # Phase 1: Link collection
    collect_links()
    progress_manager.update_main("Phase 1: Link collection completed")
    
    # Phase 2: Link dispatch  
    dispatch_links()
    progress_manager.update_main("Phase 2: Link dispatch completed")
    
    # Phase 3: Question processing
    process_questions()
    progress_manager.update_main("Phase 3: Question processing completed")
```

## Display Output System

### Progress Bar Display

The system uses `tqdm.write()` to prevent interference with progress bars:

```python
def print_phase_summary(self, phase_name: str, **stats):
    timestamp = datetime.now().strftime('%H:%M:%S')
    tqdm.write(f"\n[{timestamp}] ✅ {phase_name} completed")
    
    for key, value in stats.items():
        if key.endswith('_count'):
            label = key.replace('_count', '').replace('_', ' ').title()
            tqdm.write(f"   📊 {label}: {value}")
```

### Update Summary Integration

The progress system integrates with the update summary feature:

```python
# Display detailed update summary
if new_count > 0 or updated_count > 0 or skipped_count > 0:
    tqdm.write(f"\n📊 Update Summary:")
    tqdm.write(f"   ✅ New questions added: {new_count}")
    tqdm.write(f"   🔄 Existing questions updated: {updated_count}")
    tqdm.write(f"   ⏭️ Questions skipped (no changes): {skipped_count}")
    tqdm.write(f"✅ {exam_code}: {len(questions)} questions updated successfully")
```

## Legacy Compatibility

### LegacyProgressAdapter

For compatibility with existing scraper code:

```python
class LegacyProgressAdapter:
    def __init__(self, progress_manager: ProgressManager):
        self.progress_manager = progress_manager
    
    def progress(self, value: float, text: str = ""):
        if text:
            self.progress_manager.update_sub(text)
        else:
            self.progress_manager.update_sub()
```

### Usage in Existing Code

```python
# Old interface still works
legacy_adapter = LegacyProgressAdapter(progress_manager)
scrape_questions(links, questions_path, legacy_adapter)
```

## Performance Considerations

### Memory Usage
- Progress bars have minimal memory footprint
- Timing data is stored only for active phases
- Old phase data is automatically cleaned up

### CPU Usage
- ETA calculations are performed only when needed
- String formatting is cached where possible
- Progress updates are batched to reduce overhead

### Display Refresh Rate
- Progress bars update at reasonable intervals (not every iteration)
- Text updates use `tqdm.write()` to prevent flickering
- Position management prevents bar conflicts

## Error Handling

### Progress Bar Failures
```python
try:
    with progress_manager.main_progress(total_steps, title):
        # Operations
        pass
except Exception as e:
    # Progress bars are automatically cleaned up
    tqdm.write(f"❌ Error: {e}")
```

### Context Manager Safety
- Progress bars are automatically cleaned up on exit
- Exception handling preserves progress bar state
- Nested contexts are properly managed

## Configuration

### Customizing Delay Statistics

Update delay statistics based on your environment:

```python
progress_manager.delay_stats.update({
    'page_scraping': 2.0,      # Faster network
    'question_scraping': 5.0,  # Faster processing
    'exam_pause': 10.0         # Shorter pauses
})
```

### Progress Bar Styling

Customize progress bar appearance:

```python
with tqdm(
    total=total_items,
    desc="Custom Operation",
    unit="items",
    colour="cyan",      # Custom color
    ascii=False,        # Unicode characters
    dynamic_ncols=True, # Auto-adjust width
    miniters=1         # Update frequency
) as bar:
    # Operations
```

## Best Practices

### Development
1. **Always use context managers** for automatic cleanup
2. **Update main progress** at major phase boundaries
3. **Provide descriptive text** for progress updates
4. **Use appropriate phase types** for ETA calculations

### Production
1. **Monitor ETA accuracy** and adjust delay statistics
2. **Handle network variations** gracefully
3. **Provide user feedback** through progress text
4. **Log timing data** for performance analysis

### Debugging
1. **Enable debug logging** for timing analysis
2. **Test with small datasets** first
3. **Verify progress bar positioning** on different terminals
4. **Check memory usage** during long operations

## Future Enhancements

### Planned Features
- **Dynamic delay adjustment**: Automatically adapt based on observed performance
- **Progress persistence**: Save/restore progress across sessions
- **Multiple sub-bars**: Support for parallel processing visualization
- **Web interface**: Real-time progress display in web UI

### API Extensions
- **Progress callbacks**: Custom callback functions for progress events
- **Metrics collection**: Detailed performance metrics and analytics
- **Progress serialization**: Export progress data for analysis
- **Custom formatting**: User-defined progress bar formats

Last updated: August 2025 - Complete technical documentation for progress tracking system
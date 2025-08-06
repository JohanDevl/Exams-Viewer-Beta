#!/usr/bin/env python3
"""
Progress Manager for multi-level scraping with tqdm
Manages main and nested sub-progress bars with precise ETA calculations
"""

import time
from datetime import datetime
from typing import Optional, Dict, Any
from tqdm import tqdm
from contextlib import contextmanager


class ProgressManager:
    """
    Multi-level progress bar manager for ServiceNow scraping
    Uses tqdm for truly nested bars with positioning
    """
    
    def __init__(self, description: str = ""):
        self.description = description
        self.main_bar = None
        self.current_sub_bar = None
        self.current_main_step = 0
        self.total_main_steps = 0
        
        # Timing and ETA
        self.start_time = None
        self.phase_timings = {}
        self.current_phase = None
        
        # Bar positions (tqdm support)
        self.main_position = 0  # Main bar always at position 0
        self.sub_position = 1   # Sub-bars at position 1
        
        # Average delay statistics (based on existing code analysis)
        self.delay_stats = {
            'page_scraping': 3.0,  # 2-4s between ServiceNow pages
            'question_scraping': 7.5,  # 5-10s between questions
            'exam_pause': 15.0,  # 15s between exams
            'image_download': 0.5  # 0.5s per image
        }
    
    @contextmanager
    def main_progress(self, total_steps: int, title: str = None):
        """
        Context manager for main progress bar (stays visible)
        """
        self.total_main_steps = total_steps
        self.current_main_step = 0
        self.start_time = time.time()
        
        display_title = title or self.description
        
        with tqdm(
            total=total_steps,
            desc=f"🚀 {display_title}",
            position=self.main_position,
            leave=True,  # Main bar stays visible
            unit="step",
            colour="green"
        ) as bar:
            self.main_bar = bar
            try:
                yield self
            finally:
                self.main_bar = None
    
    @contextmanager 
    def sub_progress(self, total_items: int, title: str, phase_type: str = None):
        """
        Context manager for sub-progress bars (temporary)
        """
        self.current_phase = phase_type
        phase_start_time = time.time()
        
        with tqdm(
            total=total_items,
            desc=f"📄 {title}",
            position=self.sub_position,
            leave=False,  # Sub-bar disappears at the end
            unit="item",
            colour="blue",
            ascii=False
        ) as bar:
            self.current_sub_bar = bar
            try:
                yield self
            finally:
                if phase_type:
                    phase_duration = time.time() - phase_start_time
                    self.phase_timings[phase_type] = phase_duration
                self.current_sub_bar = None
                self.current_phase = None
    
    def update_main(self, text: str = ""):
        """
        Updates main bar and moves to next step
        """
        if self.main_bar:
            self.current_main_step += 1
            self.main_bar.update(1)
            
            # Use tqdm.write() to avoid breaking display
            if text:
                timestamp = datetime.now().strftime('%H:%M:%S')
                tqdm.write(f"[{timestamp}] {text}")
    
    def update_sub(self, text: str = ""):
        """
        Updates sub-bar
        """
        if self.current_sub_bar:
            self.current_sub_bar.update(1)
            
            # Update description if provided
            if text:
                self.current_sub_bar.set_description(f"📄 {text}")
    
    def calculate_eta(self, remaining_work: Dict[str, int]) -> str:
        """
        Calculates ETA based on remaining work and delay statistics
        
        Args:
            remaining_work: Dict with keys:
                - 'pages': number of remaining pages
                - 'questions': number of remaining questions  
                - 'exams': number of remaining exams
                - 'images': number of remaining images
        
        Returns:
            Formatted ETA (e.g., "2m 30s")
        """
        total_seconds = 0
        
        # Calculate based on average delays
        total_seconds += remaining_work.get('pages', 0) * self.delay_stats['page_scraping']
        total_seconds += remaining_work.get('questions', 0) * self.delay_stats['question_scraping']
        total_seconds += remaining_work.get('exams', 0) * self.delay_stats['exam_pause']
        total_seconds += remaining_work.get('images', 0) * self.delay_stats['image_download']
        
        return self._format_time(total_seconds)
    
    def calculate_phase_eta(self, phase_type: str, items_remaining: int, items_total: int) -> str:
        """
        Calculates ETA for a specific phase based on current performance
        """
        if phase_type in self.phase_timings and items_total > 0:
            # Use observed performance from this session
            avg_time_per_item = self.phase_timings[phase_type] / (items_total - items_remaining)
            eta_seconds = avg_time_per_item * items_remaining
        else:
            # Use default statistics
            delay_key = {
                'link_collection': 'page_scraping',
                'question_processing': 'question_scraping'
            }.get(phase_type, 'question_scraping')
            
            eta_seconds = items_remaining * self.delay_stats[delay_key]
        
        return self._format_time(eta_seconds)
    
    def _format_time(self, seconds: float) -> str:
        """
        Formats time in readable format (e.g., "2m 30s", "45s", "1h 15m")
        """
        if seconds < 60:
            return f"{int(seconds)}s"
        elif seconds < 3600:
            minutes = int(seconds // 60)
            remaining_seconds = int(seconds % 60)
            return f"{minutes}m {remaining_seconds}s" if remaining_seconds > 0 else f"{minutes}m"
        else:
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"
    
    def print_phase_summary(self, phase_name: str, **stats):
        """
        Displays phase summary with statistics (uses tqdm.write)
        """
        timestamp = datetime.now().strftime('%H:%M:%S')
        tqdm.write(f"\n[{timestamp}] ✅ {phase_name} completed")
        
        for key, value in stats.items():
            if key.endswith('_count'):
                label = key.replace('_count', '').replace('_', ' ').title()
                tqdm.write(f"   📊 {label}: {value}")
            elif key.endswith('_time'):
                label = key.replace('_time', '').replace('_', ' ').title()
                formatted_time = self._format_time(value)
                tqdm.write(f"   ⏱️  {label}: {formatted_time}")
    
    def print_final_summary(self, **stats):
        """
        Displays final summary with all statistics (uses tqdm.write)
        """
        if self.start_time:
            total_time = time.time() - self.start_time
            
            tqdm.write(f"\n🎉 Scraping completed!")
            tqdm.write(f"⏱️  Total time: {self._format_time(total_time)}")
            
            for key, value in stats.items():
                if key.endswith('_count'):
                    label = key.replace('_count', '').replace('_', ' ').title()
                    tqdm.write(f"📊 {label}: {value}")
            
            # Display phase times
            if self.phase_timings:
                tqdm.write(f"\n📈 Phase details:")
                for phase, duration in self.phase_timings.items():
                    phase_name = phase.replace('_', ' ').title()
                    tqdm.write(f"   {phase_name}: {self._format_time(duration)}")


class LegacyProgressAdapter:
    """
    Adapter to maintain compatibility with the old progress system
    """
    
    def __init__(self, progress_manager: ProgressManager):
        self.progress_manager = progress_manager
    
    def progress(self, value: float, text: str = ""):
        """
        Interface compatible with old progress.progress() system
        """
        if text:
            self.progress_manager.update_sub(text)
        else:
            self.progress_manager.update_sub()
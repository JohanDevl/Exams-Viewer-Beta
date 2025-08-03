# Usage Guide - Exams Viewer

Complete guide for using the modern Next.js Exams Viewer application for ServiceNow certification exam preparation.

## 🌐 Accessing the Application

### Online Access
Visit the live application at your deployment URL:
- Modern Next.js application with server-side rendering
- Optimized for all devices and screen sizes
- No installation required

### Local Development Access
```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Hot reload enabled for instant updates
```

## 🚀 Getting Started

### First Launch
1. **Application loads** with the exam selector dropdown
2. **System theme detection** automatically applies your preferred theme
3. **Session restoration** loads your previous progress (if any)
4. **Select an exam** from the comprehensive dropdown list

### Basic Navigation
1. **Choose an exam** from the dropdown selector
2. **Browse questions** using intuitive navigation controls
3. **Answer questions** with multiple choice selection
4. **Track progress** with real-time indicators
5. **Use keyboard shortcuts** for efficient navigation

## 📚 Exam Selection and Management

### Exam Selector
- **Dropdown interface** with all available ServiceNow certifications
- **Search functionality** to quickly find specific exams
- **Exam information** displays question count and last update
- **Automatic loading** of exam data with progress indicators

### Supported Exams
Currently supporting 20+ ServiceNow certification exams:
- **Core Certifications**: CAD, CSA, CAS-PA
- **Implementation Specialist (CIS) Series**: All major CIS certifications
- **Regular updates** ensure current content

## 🎯 Question Interface

### Question Display
- **Clear question text** with formatted content
- **Multiple choice answers** with letter identifiers (A, B, C, D)
- **Community discussions** with collapsible comments
- **Explanation sections** when available
- **Image support** for visual questions

### Answer Selection
- **Single or multiple choice** depending on question type
- **Visual feedback** for selected answers
- **Real-time validation** upon submission
- **Immediate results** with correct/incorrect indicators

### Question Actions
- **Submit Answer** - Validate your response
- **Preview Mode** - Show correct answers without affecting statistics
- **Reset Question** - Clear your answer and try again
- **Add to Favorites** - Mark important questions
- **Add Notes** - Personal annotations
- **Set Difficulty** - Rate question difficulty (Easy/Medium/Hard)

## 🧭 Navigation System

### Navigation Controls
- **Previous/Next buttons** - Sequential navigation
- **Random question** - Jump to random question for variety
- **Question number input** - Direct navigation to specific questions
- **Keyboard shortcuts** - Efficient navigation with hotkeys

### Sidebar Navigation
- **Question overview** - Visual progress indicator for all questions
- **Status indicators** - Color-coded question states
- **Quick navigation** - Click to jump to any question
- **Collapsible design** - Expandable/collapsible for screen space
- **Progress tracking** - Real-time completion percentage

### Mobile Navigation
- **Bottom navigation bar** - Thumb-friendly mobile controls
- **Swipe gestures** - Swipe left/right between questions
- **Touch-optimized** - All controls optimized for touch interaction
- **Responsive design** - Adaptive layout for all screen sizes

## ⌨️ Keyboard Shortcuts

### Navigation Shortcuts
- **Arrow Keys** - Navigate between questions (Left/Right)
- **Space** - Submit current answer
- **Enter** - Submit current answer (alternative)
- **R** - Random question
- **H** - Toggle answer preview (highlight mode)
- **F** - Toggle favorite status
- **Ctrl + S** - Open sidebar
- **Esc** - Close modals and overlays

### Number Keys
- **1, 2, 3** - Set question difficulty (Easy, Medium, Hard)
- **0** - Clear difficulty rating
- **Question numbers** - Direct navigation to specific questions

### Advanced Shortcuts
- **Ctrl + E** - Export functionality
- **Ctrl + R** - Reset current question
- **Ctrl + F** - Focus search/filter
- **?** - Show keyboard shortcuts help

## 📊 Statistics and Progress Tracking

### Real-time Statistics
- **Automatic session tracking** - Sessions start when you load an exam
- **Performance metrics** - Track correct, incorrect, and preview answers
- **Time tracking** - Monitor time spent studying
- **Progress visualization** - Interactive charts and progress bars
- **Session history** - Detailed history of all study sessions

### Statistics Dashboard
Access via the statistics button or `Ctrl + T`:

#### Overview Tab
- **Total questions answered** across all exams
- **Overall accuracy percentage** with visual charts
- **Total study time** formatted in hours, minutes, seconds
- **Favorite questions count** and management
- **Performance trends** with visual indicators

#### Per-Exam Analytics
- **Individual exam progress** with completion percentages
- **Exam-specific accuracy** and performance metrics
- **Time spent per exam** with detailed breakdowns
- **Question difficulty analysis** based on your ratings
- **Best performance tracking** and improvement indicators

#### Session History
- **Detailed session logs** with timestamps
- **Session duration** and question counts
- **Performance per session** with accuracy tracking
- **Progress over time** with trend analysis
- **Session comparison** and improvement metrics

#### Progress Charts
- **Visual progress representation** with interactive charts
- **Performance trends** over time
- **Difficulty distribution** analysis
- **Study pattern insights** and recommendations

### Data Export
- **JSON export** - Complete statistics data
- **Study reports** - Formatted performance summaries
- **Backup creation** - Export for data portability
- **Import functionality** - Restore from exported data

## 🎨 Themes and Customization

### Theme System
- **System integration** - Automatically detects your OS theme preference
- **Manual control** - Toggle between light and dark modes
- **Smooth transitions** - Animated theme changes
- **Persistent settings** - Theme preference saved across sessions

### Theme Options
- **Light mode** - Clean, bright interface
- **Dark mode** - Eye-friendly dark interface with proper contrast
- **System mode** - Follows your operating system preference
- **Automatic switching** - Responds to system theme changes

### Visual Customization
- **Component adaptation** - All UI elements adapt to theme changes
- **Color consistency** - Maintained across all interface elements
- **Accessibility** - High contrast ratios in both themes
- **Chart theming** - Statistics charts adapt to current theme

## 🔍 Search and Filtering

### Search Functionality
- **Text search** - Search within question content and answers
- **Filter by status** - Show answered, unanswered, correct, incorrect questions
- **Difficulty filtering** - Filter by your difficulty ratings
- **Favorite filtering** - Show only bookmarked questions
- **Category filtering** - Organize by custom categories

### Advanced Filtering
- **Multiple criteria** - Combine different filter types
- **Real-time filtering** - Instant results as you type
- **Filter persistence** - Saved across sessions
- **Filter indicators** - Visual feedback for active filters
- **Quick clear** - Reset all filters with one click

### Filter Combinations
- **Status + Difficulty** - Find difficult questions you got wrong
- **Favorites + Unanswered** - Review bookmarked questions you haven't attempted
- **Text + Category** - Specific topic searches within categories
- **Performance-based** - Filter by your historical performance

## 📤 Export Functionality

### Export Options
Access via the export button or through the statistics modal:

#### Question Export
- **PDF format** - Formatted for offline study
- **Include answers** - Optional answer inclusion
- **Include explanations** - Optional explanation text
- **Custom filtering** - Export only specific question subsets
- **Formatting options** - Choose layout and styling

#### Statistics Export
- **JSON format** - Complete data export
- **CSV format** - Spreadsheet-compatible format
- **Summary reports** - Human-readable performance summaries
- **Time-based exports** - Filter by date ranges
- **Selective export** - Choose specific data types

### Export Customization
- **Filter integration** - Export based on current filters
- **Date ranges** - Export specific time periods
- **Format selection** - Multiple export formats available
- **Preview options** - Preview before export
- **Batch export** - Export multiple exams simultaneously

## 📱 Mobile Usage

### Mobile Interface
- **Responsive design** - Optimized for all mobile devices
- **Touch navigation** - Gesture-based question navigation
- **Mobile keyboard** - Optimized input for mobile devices
- **Thumb-friendly controls** - Bottom navigation bar
- **Full feature support** - All desktop features available

### Mobile-Specific Features
- **Swipe navigation** - Swipe between questions
- **Pull to refresh** - Update exam data
- **Touch shortcuts** - Long press for additional options
- **Mobile optimization** - Reduced data usage and faster loading
- **Offline capabilities** - Cached content for offline study

### Mobile Performance
- **Fast loading** - Optimized for mobile networks
- **Efficient storage** - Minimized local storage usage
- **Battery optimization** - Power-efficient operation
- **Data compression** - Reduced bandwidth usage
- **Progressive loading** - Load content as needed

## ⚙️ Settings and Preferences

### Application Settings
Access via the settings button (gear icon):

#### Display Settings
- **Theme preference** - Light, dark, or system
- **Sidebar position** - Default collapsed/expanded state
- **Question layout** - Display options and formatting
- **Animation preferences** - Motion and transition settings

#### Behavior Settings
- **Keyboard shortcuts** - Enable/disable and customize
- **Sound effects** - Audio feedback settings
- **Auto-progress** - Automatic navigation options
- **Session handling** - Auto-save and restoration preferences

#### Privacy Settings
- **Statistics tracking** - Control what data is collected
- **Session persistence** - Local storage preferences
- **Data retention** - Automatic cleanup settings
- **Export permissions** - Data sharing controls

### Accessibility Options
- **High contrast mode** - Enhanced visibility
- **Font size adjustment** - Text scaling options
- **Motion reduction** - Reduced animations for sensitive users
- **Screen reader support** - Assistive technology compatibility
- **Keyboard navigation** - Full keyboard accessibility

## 🔧 Data Management

### Session Management
- **Automatic sessions** - Start when loading an exam
- **Session persistence** - Continue where you left off
- **Session history** - Track all study sessions
- **Session export** - Backup session data
- **Session analysis** - Performance insights per session

### Local Storage
- **Progress persistence** - Save progress locally
- **Settings storage** - Remember preferences
- **Cache management** - Efficient data caching
- **Storage optimization** - Compressed data storage
- **Storage cleanup** - Automatic old data removal

### Data Integrity
- **Automatic backups** - Regular data snapshots
- **Error recovery** - Restore from corruption
- **Data validation** - Ensure data consistency
- **Migration support** - Seamless updates
- **Conflict resolution** - Handle concurrent changes

## 🔧 Manual Data Updates (Python Scripts)

### Basic Update Commands

#### Update All Exams
```bash
# Smart update - only updates changed questions
python3 scripts/update_all_exams.py

# Force rescan - refresh all links
python3 scripts/update_all_exams.py --force-rescan

# Force update - refresh all existing questions
python3 scripts/update_all_exams.py --force-update

# Combined force options
python3 scripts/update_all_exams.py --force-rescan --force-update
```

#### Update Specific Exam
```bash
# Update single exam
python3 scripts/update_all_exams.py --exam CAD

# Update with force options
python3 scripts/update_all_exams.py --exam CIS-ITSM --force-rescan --force-update
```

#### Update Manifest
```bash
# Generate optimized manifest for Next.js
python3 scripts/update_manifest.py
```

### GitHub Actions (Web Interface)

#### Manual Trigger
1. **Navigate to Actions tab** on GitHub
2. **Select "Manual Data Update"** workflow
3. **Click "Run workflow"** button
4. **Configure options**:
   - **Force rescan**: Refresh all question links
   - **Force update**: Update all existing questions
   - **Specific exam**: Update only specified exam code

#### Advanced Options

**Force Rescan** is useful when:
- New questions added to ExamTopics
- Link structure changes on source website
- Complete refresh needed

**Force Update** is useful when:
- Applying scraper improvements to existing questions
- Updating `most_voted` answers that were previously null
- Ensuring latest data for all questions

## 🆘 Troubleshooting

### Common Issues

#### Application Not Loading
- **Check internet connection** for static assets
- **Clear browser cache** and reload
- **Disable browser extensions** that might interfere
- **Check browser console** for error messages

#### Questions Not Displaying
- **Verify exam data** exists in `/public/data/`
- **Check manifest.json** for exam listing
- **Try refreshing** the page
- **Check browser developer tools** for network errors

#### Statistics Not Saving
- **Enable browser localStorage** in privacy settings
- **Check storage quota** and clear old data if needed
- **Verify permissions** for data storage
- **Try incognito mode** to test without extensions

#### Performance Issues
- **Check device memory** and close unnecessary apps
- **Update browser** to latest version
- **Disable browser extensions** temporarily
- **Clear application cache** via settings

#### Theme Not Switching
- **Check system theme preference** in OS settings
- **Verify CSS custom properties support** in browser
- **Clear browser cache** and reload
- **Try manual theme toggle** in settings

### Data Issues

#### Missing Statistics
- **Check localStorage** for saved data
- **Verify data format** matches current version
- **Try data migration** via settings panel
- **Export existing data** before troubleshooting

#### Corrupted Session Data
- **Use cleanup tools** in statistics panel
- **Reset session data** via settings
- **Clear browser storage** manually
- **Restart with fresh session**

#### Export Not Working
- **Check browser popup settings** and allow downloads
- **Verify file permissions** for downloads folder
- **Try different export format** (JSON, CSV, PDF)
- **Check browser console** for export errors

### Performance Optimization

#### Slow Loading
- **Check network connection** and speed
- **Clear application cache** via browser settings
- **Close unnecessary browser tabs** to free memory
- **Update browser** to latest version

#### Memory Issues
- **Monitor memory usage** in browser developer tools
- **Close unused tabs** and applications
- **Use statistics cleanup** to remove old data
- **Restart browser** to clear memory leaks

#### Mobile Performance
- **Enable mobile optimizations** in settings
- **Clear mobile browser cache** regularly
- **Close background apps** to free resources
- **Use Wi-Fi** instead of cellular when possible

## 📞 Getting Help

### Documentation
- **Read relevant documentation** in `/docs/` folder
- **Check API documentation** for technical details
- **Review performance guide** for optimization tips
- **Browse features overview** for complete functionality list

### Community Support
- **Search existing issues** on GitHub repository
- **Create new issue** with detailed description
- **Join discussions** for community help
- **Follow project updates** for latest features

### Issue Reporting
When reporting issues, include:
- **Browser version** and operating system
- **Steps to reproduce** the problem
- **Error messages** from browser console
- **Screenshots** if applicable
- **Export data** if relevant

---

This comprehensive usage guide covers all features and functionality of the modern Next.js Exams Viewer application. The interface is designed for intuitive use while providing powerful features for effective exam preparation.
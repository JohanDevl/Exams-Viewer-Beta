# Installation Guide

## 🚀 Quick Start

### For Web Viewing Only

**No installation needed!** The Next.js application is deployed and ready to use:

- **Live Demo**: [https://yourdomain.com](https://yourdomain.com) (update with actual deployment URL)
- Modern Next.js application with server-side rendering
- Automatic theme detection and system integration
- Full statistics tracking with persistent sessions
- Optimized for all modern browsers and mobile devices

### For Development

To run the Next.js application locally or contribute to development:

```bash
# Clone the repository
git clone https://github.com/JohanDevl/Exams-Viewer.git
cd Exams-Viewer

# Install Node.js dependencies
npm install

# Install Python dependencies (for data scripts)
pip install -r requirements.txt
```

## 💻 Development Setup

### Prerequisites

- **Node.js 18+** - For Next.js development
- **npm or yarn** - Package manager for Node.js dependencies 
- **Python 3.11+** - For running data management scripts
- **Git** - For version control and cloning
- **GitHub account** - For automation and contributions
- **Modern web browser** - Chrome, Firefox, Safari, Edge with dev tools
- **Code editor** - VS Code recommended with TypeScript support

### Local Development Environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/JohanDevl/Exams-Viewer-Beta.git
   cd Exams-Viewer-Beta
   ```

2. **Install Node.js dependencies**

   ```bash
   npm install
   ```

3. **Install Python dependencies (for data scripts)**

   ```bash
   pip install -r requirements.txt
   ```

4. **Verify installation**

   ```bash
   # Check Node.js setup
   npm run lint
   
   # Check Python setup
   python -c "import requests, bs4; print('Python dependencies OK')"
   ```

5. **Start development server**

   ```bash
   # Start Next.js development server with Turbopack
   npm run dev
   ```

6. **Open in browser**
   - Navigate to `http://localhost:3000`
   - The Next.js application will load with hot reload enabled
   - All features available including SSR and optimizations

## 🔧 Dependencies

### Node.js Dependencies

The Next.js application uses modern React ecosystem dependencies:

```json
{
  "next": "15.4.5",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "zustand": "^5.0.7",
  "@radix-ui/react-*": "various",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.534.0"
}
```

Install via:

```bash
npm install
```

### Python Dependencies (Data Management)

For data scraping and management scripts:

```txt
requests>=2.31.0
beautifulsoup4>=4.12.0
```

Install via:

```bash
pip install -r requirements.txt
```

### Key Technologies

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling framework
- **Radix UI** - Accessible component primitives
- **Zustand** - Lightweight state management
- **Framer Motion** - Animation library

## 🌐 Next.js Development Server

### Development Features

The Next.js development server provides:

- **Hot Module Replacement** - Instant updates without page refresh
- **Turbopack** - Ultra-fast bundling and compilation
- **TypeScript Integration** - Real-time type checking
- **Error Overlay** - Detailed error reporting with source maps
- **Automatic Optimization** - Built-in performance optimizations

### Development Commands

#### Start Development Server

```bash
# Start with Turbopack (faster)
npm run dev

# Equivalent to: next dev --turbopack
```

#### Build and Test Production

```bash
# Build for production
npm run build

# Start production server
npm run start

# Test production build locally on http://localhost:3000
```

#### Linting and Type Checking

```bash
# Run ESLint
npm run lint

# TypeScript is checked automatically during development
```

#### Data Management (Python Scripts)

```bash
# Update exam data
python3 scripts/update_all_exams.py

# Update manifest
python3 scripts/update_manifest.py

# Scrape specific exam
python3 scripts/scraper.py [EXAM_CODE]
```

### Testing the Installation

1. **Open the Next.js application** at `http://localhost:3000`
2. **Verify SSR** - Check page source shows pre-rendered content
3. **Select an exam** from the dropdown selector
4. **Navigate through questions** using keyboard shortcuts and controls
5. **Test state persistence** - Refresh page to verify session restoration
6. **Try theme switching** - System, light, and dark modes
7. **Test statistics tracking** - Answer questions and check analytics
8. **Verify export functionality** - JSON, CSV, TXT, PDF formats
9. **Check mobile responsiveness** - Test on different screen sizes
10. **Validate TypeScript** - No type errors in development console

## 📊 Data Setup

### Initial Data

The repository includes sample data for several exams:

- CAD, CAS-PA, CIS-\* series, CSA
- Each exam includes questions and metadata
- Statistics system works immediately with existing data

### Adding New Exam Data

To add data for new exams:

1. **Run the scraper** for a new exam code:

   ```bash
   python scripts/update_all_exams.py --exam NEW_EXAM_CODE
   ```

2. **Verify data files** are created:

   ```
   data/NEW_EXAM_CODE.json
   data/NEW_EXAM_CODE_links.json
   ```

3. **Test in web interface** - new exam should appear in dropdown

### Data Validation

Verify your data setup:

```bash
# Check data directory
ls -la data/

# Validate JSON structure
python -c "import json; print('Valid JSON') if json.load(open('data/CAD.json')) else print('Invalid JSON')"

# Test scraper functionality
python scripts/update_all_exams.py --exam CAD
```

## 🚀 Deployment Options

### Vercel (Recommended for Next.js)

The optimal deployment platform for Next.js:

1. **Connect to Vercel** - Import repository from GitHub
2. **Automatic deployment** - Vercel detects Next.js configuration
3. **Environment variables** - Configure any required environment variables
4. **Custom domain** - Optional: Configure custom domain
5. **Access your site** at the provided Vercel URL

### Alternative Deployment Options

#### Netlify
```bash
# Build command
npm run build

# Publish directory
out/

# Environment variables
NEXT_EXPORT=true
```

#### Traditional Hosting (Static Export)
```bash
# Configure next.config.ts for static export
npm run build

# Deploy the 'out' directory to your hosting provider
```

### Self-Hosted Deployment

For custom hosting environments:

1. **Build the application**:

   ```bash
   npm run build
   npm run start
   ```

2. **Configure server requirements**:

   - Node.js 18+ runtime
   - Process manager (PM2, systemd, etc.)
   - Reverse proxy (nginx, Apache) for production
   - SSL certificate for HTTPS

3. **Environment setup**:

   ```bash
   # Production environment
   NODE_ENV=production
   PORT=3000
   
   # Start with PM2
   pm2 start npm --name "exams-viewer" -- start
   ```

### Docker Deployment (Advanced)

For containerized deployment:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t exams-viewer .
docker run -p 8080:80 exams-viewer
```

## 🔧 Configuration

### Environment Variables

For scraping automation, you can configure:

```bash
# Optional: Set custom delays
export SCRAPER_DELAY=10

# Optional: Set custom headers
export USER_AGENT="Custom User Agent"
```

### GitHub Actions Setup

For automated updates:

1. **Fork the repository**
2. **Configure secrets** if needed (usually not required)
3. **Enable Actions** in repository settings
4. **Test manual trigger** in Actions tab

### Custom Configuration

Create a `config.json` file for custom settings:

```json
{
  "scraper": {
    "delay": 10,
    "timeout": 30,
    "retries": 3
  },
  "interface": {
    "defaultTheme": "auto",
    "questionsPerPage": 1,
    "enableStatistics": true
  }
}
```

## 🔍 Verification

### Installation Verification Checklist

- [ ] Repository cloned successfully
- [ ] Node.js dependencies installed (`npm install`)
- [ ] Python dependencies installed (for data scripts)
- [ ] Development server running on port 3000 (`npm run dev`)
- [ ] Next.js application loads at `http://localhost:3000`
- [ ] SSR working (view page source shows pre-rendered content)
- [ ] TypeScript compilation successful
- [ ] Exam dropdown populated with available exams
- [ ] Questions load and display correctly with animations
- [ ] State management working (session persistence)
- [ ] Statistics panel opens and functions correctly
- [ ] Theme switching works (system/light/dark)
- [ ] Export features work (JSON, CSV, TXT, PDF)
- [ ] Mobile responsiveness verified
- [ ] No TypeScript errors in development console
- [ ] Hot reload working during development

### Troubleshooting Installation

#### Common Issues

**Python Dependencies**:

```bash
# If pip install fails, try:
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**CORS Issues**:

```bash
# Always use a local server, not file:// URLs
python -m http.server 8000
```

**Port Already in Use**:

```bash
# Use a different port
python -m http.server 8001
```

**JSON Loading Issues**:

- Ensure you're using a local server
- Check browser console for specific errors
- Verify JSON files exist in `data/` directory

#### Getting Help

If you encounter issues:

1. **Check existing issues** on GitHub
2. **Search documentation** in the `docs/` folder
3. **Create a new issue** with:
   - Your operating system
   - Python version (`python --version`)
   - Browser and version
   - Specific error messages
   - Steps to reproduce

## 📝 Next Steps

After installation:

1. **Read the Usage Guide** - `docs/USAGE.md`
2. **Explore Features** - `docs/FEATURES.md`
3. **Check Development Guide** - `docs/DEVELOPMENT.md`
4. **Review API Documentation** - `docs/API.md`
5. **Understand Statistics** - `docs/STATISTICS.md`

## 🔄 Updates

### Keeping Your Installation Updated

```bash
# Pull latest changes
git pull origin main

# Update dependencies if needed
pip install -r requirements.txt --upgrade

# Update exam data
python scripts/update_all_exams.py
```

### Automatic Updates

The GitHub Pages deployment automatically updates when:

- New commits are pushed to the main branch
- Manual updates are triggered via GitHub Actions
- Data files are updated through the automation system

Your local development environment will need manual updates using `git pull`.

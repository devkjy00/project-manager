# Project Management Web Dashboard

A modern web-based dashboard to manage all your projects with integrated Claude Code AI assistant.

## 🚀 Quick Start (TL;DR)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env and set PROJECTS_PATH

# 2. Start everything
./start.sh

# 3. Access
# Project Manager: http://localhost:3000
# Claude Code WebUI: http://localhost:8081
```

## Features

- 📊 **Project Overview**: View total projects, Git repositories, modified projects at a glance
- 🔍 **Filtering**: Filter by project type (Node.js, Python, Java, etc.)
- 📝 **Git Status**: Check Git branch, changes, and sync status for each project
- 🤖 **Claude Code Integration**: AI-powered coding assistant in a web interface
- 🎨 **Beautiful UI**: Modern React UI with TailwindCSS
- 🔄 **Real-time Updates**: Live project status updates

## Quick Start (Docker - Recommended)

### 1. Install Docker
- Download Docker Desktop: https://www.docker.com/products/docker-desktop

### 2. Install Claude CLI (Optional, for AI assistant)
```bash
# Visit https://claude.ai/code for installation instructions
npm install -g claude-code
```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your projects directory
# PROJECTS_PATH=/path/to/your/projects
```

### 4. Start Everything
```bash
# Start all services (Project Manager + Claude Code WebUI)
./start.sh
```

### 5. Access
- **Project Manager**: http://localhost:3000
- **Claude Code WebUI**: http://localhost:8081 (if Claude CLI is installed)

### 6. Management Commands
```bash
# Stop all services
./stop.sh

# Restart all services
./restart.sh

# Check status
docker compose ps

# View WebUI logs
tail -f logs/webui.log
```

For detailed Docker instructions, see [README.docker.md](./README.docker.md)

## Local Development

### Prerequisites
- Node.js 20+
- Claude CLI installed (https://claude.ai/code)

### Backend
```bash
cd backend
npm install
npm run dev  # Port 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Port 5173
```

### Claude Code WebUI
```bash
npm install -g claude-code-webui
claude-code-webui --port 8081
```

Access the dev frontend at **http://localhost:5173**

## Interface

### Top Statistics
- Total Projects: Total number of projects
- Git Repositories: Number of Git-initialized projects
- Modified: Number of projects with changes
- Node.js Projects: Number of Node.js projects

### Filters
- **All**: All projects
- **Node.js**: Node.js projects only
- **Python**: Python projects only
- **Java**: Java/Spring projects only
- **Modified**: Projects with Git changes only
- **No Git**: Projects without Git only

### Project Cards
Each project card displays the following information:
- Project name
- Project type (Node.js, Python, Java, etc.)
- Git status (Clean, Modified, No Git)
- Current branch
- Sync status with remote repository (ahead/behind)
- Last modified time

## API Endpoints

- `GET /api/projects` - List all projects
- `GET /api/projects/:name` - Get specific project details
- `GET /api/git-status` - Get projects with Git changes only

## Tech Stack

### Backend
- **Framework**: Hono (Fast web framework)
- **Language**: TypeScript
- **Runtime**: Node.js 20+

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4
- **Language**: TypeScript

### AI Integration
- **Claude Code**: AI-powered coding assistant
- **claude-code-webui**: Web interface for Claude CLI

### DevOps
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload for backend and frontend

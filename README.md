# Project Management Web Dashboard

A web-based dashboard to manage all your projects at a glance.

## Features

- 📊 **Project Overview**: View total projects, Git repositories, modified projects at a glance
- 🔍 **Filtering**: Filter by project type (Node.js, Python, Java, etc.)
- 📝 **Git Status**: Check Git branch, changes, and sync status for each project
- 🎨 **Beautiful UI**: Gradient background with card-based layout
- 🔄 **Auto Refresh**: Automatically update project status every 30 seconds

## Installation

```bash
# Install dependencies
npm install
```

## Usage

```bash
# Start server
npm start

# Or development mode (auto-restart)
npm run dev
```

Once the server starts, access **http://localhost:3000** in your browser.

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

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Git Integration**: child_process (execSync)

# Mapp Fashion - Hackathon Team Setup Guide

## Quick Start for Team Members

### Prerequisites
- Git installed
- Docker Desktop installed and running
- Node.js 18+ installed (for local development)
- Code editor (VS Code recommended)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/elyriond/ReEngage.git
cd ReEngage
```

### 2. Start Dittofeed Locally

```bash
cd dittofeed
docker compose -f docker-compose.lite.yaml up -d
```

Wait 30-60 seconds for services to start.

### 3. Verify Installation

Open browser: http://localhost:3000
- Password: `password`
- Workspace: `Default`

### 4. Check Running Containers

```bash
docker ps
```

You should see:
- dittofeed-lite
- postgres
- clickhouse-server
- temporal

---

## Development Workflow

### Branch Strategy

```bash
# Always create a feature branch
git checkout -b feature/your-feature-name

# Make changes, commit regularly
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Team Branches

- `main` - Protected, deployed to shared instance
- `feature/kafka-integration` - Kafka consumer service
- `feature/product-feed` - Product catalog management
- `feature/recommendations` - Recommendation engine
- `feature/ui-redesign` - Dashboard restyling
- `feature/templates` - Email templates & automations

---

## Working on Different Components

### Frontend (Dashboard/UI)
```bash
cd dittofeed/packages/dashboard
npm install
npm run dev
```

### Backend (API/Services)
```bash
cd dittofeed/packages/api
npm install
npm run dev
```

### Custom Packages (Mapp Fashion Extensions)
```bash
cd packages/product-catalog  # or any custom package
npm install
npm run dev
```

---

## Shared Demo Instance (Railway)

### Why Railway?
- ✅ $5 free credit (enough for hackathon)
- ✅ Auto-deploy from Git (team sees changes instantly)
- ✅ No cold starts
- ✅ Easy rollback

### Setup (Team Lead Only)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd dittofeed
   railway init
   # Choose: "Create new project"
   # Name: mapp-fashion
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set PASSWORD=<strong-password>
   railway variables set WORKSPACE_NAME=MappFashion
   ```

6. **Get Public URL**
   ```bash
   railway domain
   # Creates: mapp-fashion-production.up.railway.app
   ```

7. **Share with Team**
   - Add team members in Railway dashboard
   - Share URL and credentials

### Access Shared Instance

**URL**: `https://mapp-fashion-production.up.railway.app` (or similar)

**Purpose**:
- Demo to judges/stakeholders
- Integration testing
- End-to-end testing with real data

**Credentials**:
- Password: `<team-lead-provides>`
- Workspace: `MappFashion`

**When to use**:
- Testing full flow with Kafka
- Showing progress to team
- Final demo preparation

### Auto-Deploy from Git

Once Railway is connected to your GitHub repo:
```bash
# Any push to main automatically deploys
git push origin main

# Check deployment status
railway status

# View logs
railway logs
```

---

## Common Commands

### Docker Management

```bash
# Stop all containers (data persists)
docker compose -f docker-compose.lite.yaml down

# Start containers
docker compose -f docker-compose.lite.yaml up -d

# View logs
docker compose -f docker-compose.lite.yaml logs -f

# Restart a specific service
docker compose -f docker-compose.lite.yaml restart lite

# Fresh start (⚠️ deletes all data)
docker compose -f docker-compose.lite.yaml down -v
docker compose -f docker-compose.lite.yaml up -d
```

### Database Access

```bash
# PostgreSQL
docker exec -it dittofeed-postgres-1 psql -U postgres -d dittofeed

# ClickHouse
docker exec -it dittofeed-clickhouse-server-1 clickhouse-client
```

---

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Stop the process or change port in docker-compose.yaml
```

### Docker Not Starting
```bash
# Restart Docker Desktop
# Wait 2 minutes, then retry
docker compose -f docker-compose.lite.yaml up -d
```

### Changes Not Reflecting
```bash
# Rebuild containers
docker compose -f docker-compose.lite.yaml up -d --build

# Or restart specific service
docker compose -f docker-compose.lite.yaml restart lite
```

### Database Issues
```bash
# Reset database (⚠️ deletes data)
docker compose -f docker-compose.lite.yaml down -v
docker compose -f docker-compose.lite.yaml up -d
```

---

## Project Structure

```
mapp-fashion/
├── dittofeed/              # Base Dittofeed (submodule)
├── packages/
│   ├── kafka-consumer/     # Kafka integration
│   ├── product-catalog/    # Product feed management
│   ├── recommendation-engine/  # Recommendation logic
│   └── mapp-dashboard/     # Custom UI
├── services/
│   └── kafka-consumer/     # Background services
├── docs/
│   ├── MAPP_FASHION_REVISED_PLAN.md
│   └── TEAM_SETUP.md
└── scripts/
    ├── setup-local.sh
    └── backup-db.sh
```

---

## Communication & Coordination

### Daily Standup (Recommended)
- What did you work on?
- What are you working on today?
- Any blockers?

### Git Commits
- Commit early and often
- Clear commit messages
- Reference issue/task numbers if using

### Pull Requests
- Small, focused PRs
- Clear description
- Tag relevant team members for review

### Slack/Discord Channel (if applicable)
- Share progress
- Ask for help
- Coordinate integration points

---

## Demo Preparation

### Before Demo:
1. Ensure shared instance is running
2. Load sample product catalog
3. Create sample user journeys
4. Test all automations
5. Prepare demo script
6. Have backup plan (local demo if shared instance fails)

### Demo Checklist:
- [ ] Shared instance accessible
- [ ] Sample data loaded
- [ ] Key automations working
- [ ] UI looks polished
- [ ] Kafka stream flowing (if ready)
- [ ] Product recommendations working
- [ ] Email templates look good

---

## Quick Reference

### Ports
- `3000` - Dittofeed Dashboard
- `3001` - API (if running separately)
- `5432` - PostgreSQL
- `8123` - ClickHouse HTTP
- `7233` - Temporal

### Default Credentials
- Dittofeed Password: `password`
- PostgreSQL: `postgres` / `password`
- ClickHouse: `dittofeed` / `password`

### Useful Links
- Dittofeed Docs: https://docs.dittofeed.com
- Project Plan: See `MAPP_FASHION_REVISED_PLAN.md`
- Dittofeed GitHub: https://github.com/dittofeed/dittofeed

---

## Need Help?

1. Check this guide first
2. Ask in team chat
3. Check Dittofeed documentation
4. Google the error message
5. Ask team lead

---

**Happy Hacking! 🚀**

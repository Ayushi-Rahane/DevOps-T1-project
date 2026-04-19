# IssueSphere — Campus Complaint Management System

A microservices-based complaint management platform built with Node.js, React, and MongoDB.

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| `auth-service` | 5001 | User registration & JWT authentication |
| `complaint-service` | 5002 | CRUD operations for complaints |
| `notification-service` | 5003 | Real-time notification logging |
| `api-gateway` | 5005 | Reverse proxy routing all `/api/*` calls |
| `frontend` | 5173 | Vite + React SPA |

## Quick Start

### 1. Start with Docker (recommended)
```bash
docker compose up --build
```
All 5 services + frontend will start. Open http://localhost:5173

### 2. Seed the Database
```bash
npm run seed
```

### 3. Login Credentials
| Role | Email | Password | Security Key |
|------|-------|----------|--------------|
| Student | alice@campus.com | Password@123 | — |
| Student | bob@campus.com | Password@123 | — |
| Admin | admin@campus.com | Admin@123 | admin123 |

---

## Selenium E2E Testing

Automated end-to-end tests using **Selenium WebDriver** (JavaScript) + **ChromeDriver**.

### What's Tested

| # | Test Suite | User Flows Covered |
|---|------------|--------------------|
| 1 | **Student Login** | Login → Dashboard loads → Complaint cards visible → Logout |
| 2 | **Complaint Submission** | Login → Navigate to form → Fill & submit → Alert confirmed → Complaint appears on My Complaints |
| 3 | **Admin Login & Dashboard** | Admin login (with security key) → Dashboard stats visible → Complaint cards → Category filter → Logout |

### Prerequisites

- **Google Chrome** installed on your machine
- **Node.js** (v18+)
- The app must be **running** before executing tests (via Docker or locally)

### Setup (one-time)
```bash
cd selenium-tests
npm install
```

### Run All Selenium Tests
```bash
# From project root:
npm run test:selenium

# Or equivalently:
npm run test:e2e
```

### Run Individual Tests
```bash
cd selenium-tests
npm run test:student-login
npm run test:admin-login
npm run test:complaint
```

### Headless Mode (for CI/Jenkins)
```bash
HEADLESS=true npm run test:selenium
```

### Test File Structure
```
selenium-tests/
├── package.json            # Dependencies (selenium-webdriver, chromedriver)
├── helpers.js              # Shared utilities (driver builder, login helpers, wait functions)
├── runner.js               # Runs all test suites sequentially
└── tests/
    ├── studentLogin.test.js        # Test 1: Student login flow
    ├── complaintSubmission.test.js  # Test 2: Complaint submission flow
    └── adminLogin.test.js           # Test 3: Admin login & dashboard
```

### Frontend Testability

All key UI elements have `data-testid` attributes for reliable Selenium selectors:
- `tab-student`, `tab-admin` — Auth page role tabs
- `student-email`, `student-password`, `student-login-btn` — Student login form
- `admin-email`, `admin-password`, `admin-key`, `admin-login-btn` — Admin login form
- `dashboard-title`, `btn-raise-complaint` — Student dashboard
- `admin-dashboard-title` — Admin dashboard
- `complaint-card` — Each complaint card
- `nav-*` — Sidebar navigation items
- `logout-btn` — Logout button
- `raise-complaint-title` — Raise complaint page
- `my-complaints-title` — My complaints page

### Assumptions & Limitations

- Tests require the **database to be seeded** (`npm run seed`) before running
- Tests run against `http://localhost:5173` by default (override with `APP_URL` env var)
- Chrome must be installed; ChromeDriver version is managed by the `chromedriver` npm package
- Tests run **sequentially** (not in parallel) to avoid state conflicts
- The complaint submission test creates a new complaint each run (doesn't clean up)

---

## Jenkins CI/CD Pipeline

Automated build and test pipeline using **Jenkins** for Continuous Integration.

### What Jenkins Does

Jenkins automates the entire build-test cycle. Every time code is pushed, Jenkins:
1. Pulls the latest code from Git
2. Installs all dependencies
3. Builds the frontend to check for compile errors
4. Starts all microservices using Docker Compose
5. Seeds the database with test data
6. Runs Selenium E2E tests in headless Chrome
7. Cleans up all Docker containers after completion

### Pipeline Stages

| # | Stage | What It Does |
|---|-------|-------------|
| 1 | **Checkout** | Pulls the latest code from the Git repository |
| 2 | **Install Dependencies** | Runs `npm install` for root and selenium-tests |
| 3 | **Build Frontend** | Runs `npm run build` in frontend to verify the React app compiles |
| 4 | **Start Services** | Runs `docker compose up -d --build` and waits for all services to be ready |
| 5 | **Seed Database** | Runs `npm run seed` to insert test users and complaints |
| 6 | **Run Selenium Tests** | Runs `npm run test:selenium` in headless mode |
| — | **Cleanup (always)** | Runs `docker compose down` to stop and remove all containers |

### Prerequisites for Jenkins

The Jenkins server (or agent) must have:
- **Node.js** (v18+) and npm
- **Docker** and Docker Compose
- **Google Chrome** browser
- **Git**

### How to Set Up in Jenkins

1. **Install Jenkins** on your machine (or use Docker)
2. **Install required plugins**: Pipeline, Git, NodeJS
3. **Create a new Pipeline job**:
   - Go to Jenkins → New Item → Pipeline
   - Name it: `IssueSphere-CI`
   - Under Pipeline section, select **Pipeline script from SCM**
   - SCM: Git
   - Repository URL: your Git repository URL
   - Branch: `*/main` (or your branch name)
   - Script Path: `Jenkinsfile`
4. **Save and click "Build Now"**

### How It Connects Together

```
Git Push → Jenkins detects change → Pulls code
    → Installs deps → Builds frontend
    → Docker Compose starts all services
    → Seeds MongoDB with test data
    → Selenium tests run in headless Chrome
    → Docker Compose cleans up
    → Jenkins reports PASS / FAIL
```

### Key Files

| File | Purpose |
|------|---------|
| `Jenkinsfile` | Defines the CI/CD pipeline stages |
| `wait-for-services.js` | Health-check script that waits for services to be ready |

---

## Project Structure
```
├── auth-service/           # JWT auth microservice
├── complaint-service/      # Complaint CRUD microservice
├── notification-service/   # Notification logging microservice
├── api-gateway/            # HTTP reverse proxy
├── frontend/               # Vite + React frontend
├── selenium-tests/         # Selenium E2E test suite
├── docker-compose.yml      # Multi-container orchestration
├── Jenkinsfile             # Jenkins CI/CD pipeline definition
├── wait-for-services.js    # Service readiness health-check
├── seed.js                 # Database seeding script
└── README.md
```
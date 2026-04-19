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

## Project Structure
```
├── auth-service/           # JWT auth microservice
├── complaint-service/      # Complaint CRUD microservice
├── notification-service/   # Notification logging microservice
├── api-gateway/            # HTTP reverse proxy
├── frontend/               # Vite + React frontend
├── selenium-tests/         # Selenium E2E test suite
├── docker-compose.yml      # Multi-container orchestration
├── seed.js                 # Database seeding script
└── README.md
```
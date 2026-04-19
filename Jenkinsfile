pipeline {
    agent any

    environment {
        // Run Selenium in headless mode (no GUI) inside Jenkins
        HEADLESS = 'true'
    }

    stages {

        // ──────────────────────────────────────────────
        // Stage 1: Checkout source code from Git
        // ──────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        // ──────────────────────────────────────────────
        // Stage 2: Install root-level dependencies
        //          (needed for seed.js — mongodb, bcryptjs)
        // ──────────────────────────────────────────────
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing root dependencies...'
                sh 'npm install'

                echo '📦 Installing Selenium test dependencies...'
                sh 'cd selenium-tests && npm install'
            }
        }

        // ──────────────────────────────────────────────
        // Stage 3: Build frontend for production
        //          (validates that the React app compiles)
        // ──────────────────────────────────────────────
        stage('Build Frontend') {
            steps {
                echo '🏗️  Building frontend...'
                sh 'cd frontend && npm install && npm run build'
            }
        }

        // ──────────────────────────────────────────────
        // Stage 4: Start all services using Docker Compose
        // ──────────────────────────────────────────────
        stage('Start Services') {
            steps {
                echo '🐳 Starting all services with Docker Compose...'
                sh 'docker compose up -d --build'

                echo '⏳ Waiting for services to be ready...'
                sh 'node wait-for-services.js'
            }
        }

        // ──────────────────────────────────────────────
        // Stage 5: Seed the database with test data
        // ──────────────────────────────────────────────
        stage('Seed Database') {
            steps {
                echo '🌱 Seeding database with test data...'
                sh 'npm run seed'
            }
        }

        // ──────────────────────────────────────────────
        // Stage 6: Run Selenium E2E tests
        // ──────────────────────────────────────────────
        stage('Run Selenium Tests') {
            steps {
                echo '🧪 Running Selenium E2E tests (headless)...'
                sh 'npm run test:selenium'
            }
        }
    }

    // ──────────────────────────────────────────────────
    // Post-build actions: always clean up Docker
    // ──────────────────────────────────────────────────
    post {
        always {
            echo '🧹 Cleaning up Docker containers...'
            sh 'docker compose down --volumes --remove-orphans || true'
        }
        success {
            echo '✅ Pipeline completed successfully! All tests passed.'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above for details.'
        }
    }
}

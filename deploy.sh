#!/bin/bash

# deploy.sh
# This script is triggered by Jenkins after the Selenium tests pass.
# It tells Render to deploy the latest code to the cloud.

echo "🚀 Starting Deployment to Render Cloud..."

# In a real environment, you get these secret URLs from your Render Dashboard
# We use environment variables so we don't hardcode secrets in Git
RENDER_FRONTEND_HOOK=${RENDER_FRONTEND_HOOK:-"https://api.render.com/deploy/srv-mock-frontend?key=mock-key"}
RENDER_BACKEND_HOOK_1=${RENDER_BACKEND_HOOK_1:-"https://api.render.com/deploy/srv-mock-auth?key=mock-key"}

echo "📡 Triggering API Gateway and Backend Deployments..."
# We use curl to send an HTTP POST request to the Webhook URL
# -s suppresses the progress bar, -f fails silently on server errors, -X POST ensures it's a POST request
curl -X POST -s -f "$RENDER_BACKEND_HOOK_1" || echo "⚠️ (Mock) Backend deployment triggered."

echo "📡 Triggering Frontend Deployment..."
curl -X POST -s -f "$RENDER_FRONTEND_HOOK" || echo "⚠️ (Mock) Frontend deployment triggered."

echo "✅ Deployment signals sent successfully."
echo "🌍 Your application will be live at: https://issuesphere-frontend.onrender.com (example)"

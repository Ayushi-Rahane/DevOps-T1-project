const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));

// Health check endpoint for Docker
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Detailed proxy logging
const logProxy = (proxyReq, req, res) => {
    console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.host}${proxyReq.path}`);
};

// Route mapping configuration
const routes = {
    '/api/auth': process.env.AUTH_SERVICE_URL || 'http://auth-service:5001',
    '/api/complaints': process.env.COMPLAINT_SERVICE_URL || 'http://complaint-service:5002',
    '/api/notifications': process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5003',
};

// Setup proxies
for (const [path, target] of Object.entries(routes)) {
    app.use(path, createProxyMiddleware({
        target,
        changeOrigin: true,
        proxyTimeout: 10000, // 10 seconds
        timeout: 10000,
        pathRewrite: {
            [`^${path}`]: '', // Refactor this if your individual services expect the prefix
        },
        onProxyReq: logProxy,
        onError: (err, req, res) => {
            console.error(`[PROXY ERROR] target ${target}:`, err);
            res.status(502).json({ error: 'Service Unavailable', target });
        }
    }));
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Gateway Internal Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});

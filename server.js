const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const fileListRouter = require('./routes/file-list');

require('dotenv').config();

const app = express();

const path = require('path');
const rfs = require('rotating-file-stream');

// const CONTEXT_PATH = '/biostudies/submissions';
const PORT = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL;
const CONTEXT_PATH = process.env.CONTEXT_PATH;

// Create a rotating write stream for access logs
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // daily rotation
  path: path.join(__dirname, 'logs')
});

// Use morgan with combined format & file stream
app.use(morgan('combined', { stream: accessLogStream }));

// Keep console logging for dev
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Mount the file-list router before the proxy middleware
app.use(CONTEXT_PATH, fileListRouter);

// Proxy API requests
app.use(`${CONTEXT_PATH}/api`, createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    [`^${CONTEXT_PATH}/api`]: '',
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} -> ${BACKEND_URL}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  },
  timeout: 3600000,
  proxyTimeout: 3600000,
  limit: 'Infinity'
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect(CONTEXT_PATH);
});

const pathToDist = path.join(__dirname, './frontend/dist');

// Serve static files
app.use(CONTEXT_PATH, express.static(pathToDist));

// SPA fallback
app.get(`${CONTEXT_PATH}/*`, (req, res) => {
  res.sendFile(path.join(pathToDist, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`BioStudies Submission Tool running on http://localhost:${PORT}${CONTEXT_PATH}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
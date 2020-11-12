const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api',
        createProxyMiddleware({
            pathRewrite: {'/api': ''},
            target: 'http://localhost:5001/gijernet-no/us-central1/',
            changeOrigin: false,
        })
    );
};
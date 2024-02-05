const path = require('path');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');

function getExternalIP() {
	const networkInterfaces = os.networkInterfaces();
	for (const key of Object.keys(networkInterfaces)) {
		const iface = networkInterfaces[key];
		for (const alias of iface) {
			if (alias.family === 'IPv4' && alias.internal === false) {
				return alias.address;
			}
		}
	}
	return 'Unknown';
}

function startCommand(projectPath = '.') {
	const httpsPort = 443;
	const httpPort = 80;
	const app = express();

	// Set up a static file server to serve the content of the specified path
	app.use(express.static(projectPath));

	// Handle requests for the root path ("/") by serving the index.html file
	app.get('/', (req, res) => {
		res.sendFile(path.join(projectPath, 'index.html'));
	});

	// Check if SSL certificate and key files exist
	const sslCertPath = path.join(projectPath, 'certificate.pem');
	const sslKeyPath = path.join(projectPath, 'private-key.pem');
	let server;

	const createHTTPServer = () => {
		const httpServer = http.createServer(app);
		httpServer.listen(httpPort, () => {
			console.log(`HTTP Server is running on port ${httpPort}`);
			console.log(
				`External IP address: http://${getExternalIP()}:${httpPort}`,
			);
		});
		return httpServer;
	};

	if (fs.existsSync(sslCertPath) && fs.existsSync(sslKeyPath)) {
		// Serve on both HTTP and HTTPS
		const httpsOptions = {
			cert: fs.readFileSync(sslCertPath),
			key: fs.readFileSync(sslKeyPath),
		};

		try {
			server = https.createServer(httpsOptions, app);
			server.listen(httpsPort, () => {
				console.log(
					`Server is running on https://localhost:${httpsPort}`,
				);
				console.log(
					`External IP address: https://${getExternalIP()}:${httpsPort}`,
				);
			});
		} catch (err) {
			console.error('Error starting HTTPS server:', err.message);
		}
	} else {
		// Serve only on HTTP (port 80) or fall back to port 3000
		server = createHTTPServer();

		// Handle port 80 errors by falling back to port 3000
		server.on('error', (err) => {
			if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
				// Port 80 is unavailable, fall back to port 3000
				server = http.createServer(app);
				server.listen(3000, () => {
					console.log('Server is running on http://localhost:3000');
					console.log(
						`External IP address: http://${getExternalIP()}:3000`,
					);
				});
			} else {
				console.error('Error starting HTTP server:', err.message);
			}
		});
	}

	server.on('close', () => {
		console.log('Server has quit');
	});
}

module.exports = startCommand;

/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-26 18:53:49
 * @FilePath     : /Visualify.cli/src/commands/serve.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
// commands/serve.js

const browserSync = require('browser-sync').create(); // Note the use of .create()
const fs = require('fs');
const path = require('path');

function serveCommand(projectPath = 'docs') {
	const docsDirectory = projectPath;

	const indexPath = path.join(docsDirectory, 'index.html');

	// Check if the 'docs' directory exists
	if (!fs.existsSync(docsDirectory)) {
		console.error(
			`No '${docsDirectory}' directory found. Please run 'visualify init' first.`,
		);
		return;
	}

	// Check if the 'index.html' file exists
	if (!fs.existsSync(indexPath)) {
		console.error(
			`No 'index.html' file found in the '${docsDirectory}' directory. Please run 'visualify init' first.`,
		);
		return;
	}

	// Configure browser-sync for live reloading and serving 'docs' directory
	browserSync.init({
		server: docsDirectory, // Serve files from the 'docs' directory
		files: [`${docsDirectory}/**/*`], // Watch for changes in the 'docs' directory
		notify: true, // Disable notifications
		open: true, // Do not automatically open a browser window
		port: 3000, // Set the port to 3000
	});

	browserSync.emitter.on('init', () => {
		console.log('Server is running on http://localhost:3000');
	});

	browserSync.emitter.on('exit', () => {
		console.log('Server has quit');
		process.exit();
	});
}

module.exports = serveCommand;

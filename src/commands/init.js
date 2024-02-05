/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-26 18:53:35
 * @FilePath     : /Visualify.cli/src/commands/init.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
// commands/init.js

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

async function copyFile(source, destination) {
	return new Promise((resolve, reject) => {
		const sourceStream = fs.createReadStream(source);
		const destinationStream = fs.createWriteStream(destination);

		sourceStream.on('error', reject);
		destinationStream.on('error', reject);

		destinationStream.on('finish', resolve);

		sourceStream.pipe(destinationStream);
	});
}

async function initCommand(projectPath = 'docs') {
	try {
		// Create the project directory if it doesn't exist
		if (!fs.existsSync(projectPath)) {
			await promisify(fs.mkdir)(projectPath, { recursive: true });
		}

		// Define the structure of the new data portal project
		const structure = [
			'.nojekyll', // Add the .nojekyll file
		];

		// Create the structure of the new data portal project
		for (const element of structure) {
			const elementPath = path.join(projectPath, element);
			if (!fs.existsSync(elementPath)) {
				await promisify(fs.writeFile)(elementPath, '');
			}
		}

		// Copy the index.html and config.json from templates to the project directory
		const templatesDirectory = path.join(__dirname, '..', 'templates'); // Adjust the path to your templates directory
		await copyFile(
			path.join(templatesDirectory, 'index.html'),
			path.join(projectPath, 'index.html'),
		);
		await copyFile(
			path.join(templatesDirectory, 'home.json'),
			path.join(projectPath, 'home.json'),
		);

		// Create any additional directories or files here if needed

		console.log(
			`Initialized a new data portal project at: ${path.resolve(
				projectPath,
			)}`,
		);
	} catch (err) {
		console.error('Error initializing the project:', err.message);
	}
}

module.exports = initCommand;

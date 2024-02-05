/*
 * @Author       : Lihao usleolihao@gmail.com
 * @Date         : 2023-10-19 11:20:56
 * @FilePath     : /Visualify.cli/src/commands/Rtree/loadJson.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (usleolihao@gmail.com), All Rights Reserved.
 */
const fs = require('fs');

/**
 * Loads a JSON file and returns its content.
 *
 * @param {string} filePath - The path to the JSON file.
 * @return {array|object|null} The parsed JSON data or null if an error occurred.
 */
module.exports = function loadJson(filePath, debug = true) {
	try {
		// Step 1: Read and Parse JSON
		const rawData = fs.readFileSync(filePath, 'utf-8');
		const dataPoints = JSON.parse(rawData);

		// Step 2: Validate JSON
		if (!isValidForRtree(dataPoints)) {
			console.error(
				'The JSON data is not in the correct format for R-tree processing.',
			);
			return null;
		}

		if (debug) {
			// Step 3: Log Information
			if (typeof dataPoints === 'object' && !Array.isArray(dataPoints)) {
				const keys = Object.keys(dataPoints);
				for (const key of keys) {
					const elements = dataPoints[key];
					if (Array.isArray(elements) && elements.length > 5) {
						console.log(
							`Key: ${key}, Sample Data: ${pickRandom(
								elements,
								5,
							)}`,
						);
					} else {
						console.log(`Key: ${key}, Data: ${elements}`);
					}
				}
			}
		}
		return dataPoints;
	} catch (error) {
		console.error(`Error reading file from ${filePath}:`, error);
		return null;
	}
};

/**
 * Checks if the data is valid for R-tree processing.
 *
 * @param {array|object} data - The data to validate.
 * @return {boolean} True if valid, false otherwise.
 */
function isValidForRtree(data) {
	if (typeof data !== 'object' || Array.isArray(data)) {
		throw new Error('The data is not an object');
	}

	// Check if each key is associated with an array
	const keys = Object.keys(data);
	for (const key of keys) {
		if (!Array.isArray(data[key])) {
			throw new Error(`The value of ${key} is not an array`);
		}
	}

	// check if each key has the same length
	const arrayLength = data[keys[0]].length;
	for (const key of keys) {
		if (data[key].length !== arrayLength) {
			throw new Error(
				`The length of ${key} is not equal to the length of ${keys[0]}`,
			);
		}
	}

	return true;
}

/**
 * Picks n random elements from an array for logging.
 *
 * @param {array} arr - The array to pick from.
 * @param {number} n - The number of elements to pick.
 * @return {array} An array containing n random elements from arr.
 */
function pickRandom(arr, n) {
	const result = [];
	for (let i = 0; i < n; i++) {
		const randomIndex = Math.floor(Math.random() * arr.length);
		result.push(arr[randomIndex]);
	}
	return result;
}

/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-10-27 11:54:04
 * @FilePath     : /Visualify.cli/src/commands/Rtree/mapping.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const fs = require('fs');
const path = require('path');
const loadJson = require('./loadJson');

/**
 * Saves a mapping from one file to another.
 * @param {string} filePath - The path of the original file.
 * @param {string} filePath2 - The path of the new file.
 * @param {Array} keys - Optional keys to be used for mapping.
 */
module.exports = function saveMapping(filePath, options) {
	const { keys, saved_path = path.dirname(filePath) } = options;
	console.log('Options:', options);
	// Default mapping keys
	const DefaultMap = ['Cell_ID', 'Stage', 'Cell_Type'];

	// Load the original data
	const data = loadJson(filePath);

	// Initialize mappings
	const mappings = {};

	console.log('Path:', filePath, 'Saved Path:', saved_path);

	const mapping_keys = keys ? keys : Default;
	// If keys are provided, use them for mapping
	if (mapping_keys) {
		console.log('Optional Keys:', mapping_keys);
	} else {
		console.log('Default Mapping');
	}

	// Create mapping for each key in the default map
	mapping_keys.forEach((key) => {
		console.log(`Creating ${key} Mapping Dictionary`);
		let temp_mappings = createMapping(data[key]);
		data[key] = data[key].map((each) => temp_mappings[each]);
		mappings[key] = createReverseMapping(temp_mappings);
	});

	// Save each mapping to a file
	mapping_keys.forEach((key) => {
		const mappingFilePath = path.join(saved_path, `${key}_Mapping.json`);
		console.log(`Saving Mapping ${key} to ${mappingFilePath}`);
		fs.writeFileSync(mappingFilePath, JSON.stringify(mappings[key]));
	});

	// Save the new data
	const n_datapath = filePath.replace('.json', '_mapping.json');
	console.log(`Saved new dataset to ${n_datapath}`);
	fs.writeFileSync(n_datapath, JSON.stringify(data));

	console.log('Mapping Complete');
	return n_datapath;
};

/**
 * Creates a mapping object from an array of data.
 *
 * @param {Array} dataArray - The array of data to create a mapping from.
 * @return {Object} mapping - The mapping object created from the data array.
 */
function createMapping(dataArray) {
	const uniqueValues = [...new Set(dataArray)];
	const mapping = {};
	uniqueValues.forEach((value, index) => {
		mapping[value] = index;
	});
	return mapping;
}

// function to create reverse mapping
function createReverseMapping(mapping) {
	// create empty object for reverse mapping
	const reverseMapping = {};

	// iterate over key-value pairs of mapping
	for (const [key, value] of Object.entries(mapping)) {
		// assign key as value and vice versa to reverseMapping
		reverseMapping[value] = key;
	}

	// return reverse mapping object
	return reverseMapping;
}

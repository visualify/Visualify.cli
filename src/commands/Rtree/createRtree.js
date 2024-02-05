/*
 * @Author       : Lihao usleolihao@gmail.com
 * @Date         : 2023-10-19 11:21:09
 * @FilePath     : /Visualify.cli/src/commands/Rtree/createRtree.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (usleolihao@gmail.com), All Rights Reserved.
 */
const fs = require('fs');
const path = require('path');
const RTree2D = require('../../core/Rtree2D');
const LazyRtree2D = require('../../core/lazyRtree2D');
const Point = require('../../core/Point');
const loadJson = require('./loadJson');
const saveMapping = require('./mapping');

module.exports = function createRtree2D(filePath, options) {
	const {
		x,
		y,
		savedPath = path.dirname(filePath),
		threshold = 1000,
	} = options;

	if (options.directory) {
		// check if the filePath is a directory
		if (!fs.lstatSync(filePath).isDirectory()) {
			console.error('Error: The path is not a directory');
			return;
		}

		console.log('Processing the directory of files');
		const files = fs.readdirSync(filePath);
		for (const file of files) {
			// ignore hidden files and files that are not json
			if (
				file.startsWith('.') ||
				!file.endsWith('.json') ||
				file === 'metadata.json' ||
				file.includes('mapping')
			) {
				continue;
			}
			const filePath2 = path.join(filePath, file);
			console.log(`Processing file: ${filePath2}`);
			createRtree2D(filePath2, { ...options, directory: false });
		}
		return;
	}

	let dataPoints = loadJson(filePath, false);
	const keys = Object.keys(dataPoints);
	// removed values of dataPoints related to 3D
	for (const key of keys) {
		if (key.includes('3D')) {
			delete dataPoints[key];
		}
	}
	const filteredKeys = keys.filter((key) => !key.includes('3D'));
	integrity_check(dataPoints, keys);
	const rtree = new RTree2D();
	const Default = {
		x: '2D_UMAP_1',
		y: '2D_UMAP_2',
	};
	if (!x) {
		console.log('Warning: Using the Default value 2D_UMAP_1 as x');
	} else {
		Default['x'] = x;
	}
	if (!y) {
		console.log('Warning: Using the Default value 2D_UMAP_2 as y');
	} else {
		Default['y'] = y;
	}

	if (
		!filteredKeys.includes(Default['x']) ||
		!filteredKeys.includes(Default['y'])
	) {
		console.error('Error: x or y is not in the data');
		return;
	}

	//obtain the name of the file
	const fileName = path.basename(filePath, '.json').replace('_mapping', '');
	console.log(`Starting create Rtree2D for ${fileName}.`);
	// extend the savedPath with the name of the file
	const savedPath2 = path.join(savedPath, fileName);
	// if the savedPath2 does not exist, create it
	if (!fs.existsSync(savedPath2)) {
		fs.mkdirSync(savedPath2);
	}

	if (options.mapping) {
		console.log('Creating a mapping');
		const mapped_dst = saveMapping(filePath, {
			keys: options.mapping,
			saved_path: savedPath2,
		});
		console.log('Building Rtree2D with the mapped data from', mapped_dst);
		const { mapping, ...newoptions } = options;
		createRtree2D(mapped_dst, { ...newoptions, directory: false });
		return;
	}

	const Points = [];
	// insert dataPoints into Rtree
	for (let i = 0; i < dataPoints[filteredKeys[0]].length; i++) {
		const point = new Point({
			x: dataPoints[Default['x']][i],
			y: dataPoints[Default['y']][i],
		});

		for (key of filteredKeys) {
			if (key == Default['x'] || key == Default['y']) continue;
			point.setProperty(key, dataPoints[key][i]);
		}

		Points.push(point);
	}

	rtree.load(Points);
	rtree.saveToChunks({ directory: savedPath2 });
	console.log(`Done. saved Rtree2D to ${savedPath2}`);

	console.log(`Starting create a LazyRtree2D for Rtree2D.`);
	const metadata_path = savedPath2 + '/metadata.json';
	console.log(`metadata path is ${metadata_path}`);

	const lazyTree = new LazyRtree2D({
		downsampleThreshold: threshold,
		metadata: metadata_path,
	});

	lazyTree.saveLazyRtree({ filePath: savedPath2 + '/lazy_chunk.bin' });
	console.log(`Done. saved LazyRtree to ${savedPath2}`);
	//return rtree;
	//console.log(rtree.toJSON());
};

function integrity_check(dataPoints, keys = null) {
	if (!keys) {
		keys = Object.keys(dataPoints);
	}
	// each value of dataPoints should be an array
	for (const key of keys) {
		const value = dataPoints[key];
		if (!Array.isArray(value)) {
			return false;
		}
	}
	// each value of dataPoints should have the same length
	const firstValueLength = dataPoints[keys[0]].length;
	for (const key of keys) {
		if (dataPoints[key].length !== firstValueLength) {
			return false;
		}
	}
	return true;
}

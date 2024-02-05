/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-04 12:12:30
 * @FilePath     : /Visualify.cli/src/core/lazyRtree2D.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const fs = require('fs');
const path = require('path');
const Point = require('./Point');
const RTree2D = require('./Rtree2D');
const hilbert = require('hilbert');

class LazyRtree2D extends RTree2D {
	constructor(options = {}) {
		const {
			downsampleThreshold = 1000,
			hilbertOrder = 16,
			metadata = null,
		} = options;
		super(options);

		this.downsampleThreshold = downsampleThreshold;
		this.hilbertOrder = hilbertOrder;
		this.metadata = this.loadMetadata(metadata);
		this.loadedChunks = new Map();

		if (metadata != null) {
			// Prepare metadata nodes for bulk-loading into the R-tree
			const nodesToLoad = this.metadata.map((node) => {
				return {
					...node,
					d_points: this.downsampleChunk(node.directory),
				};
			});

			//console.log(this.metadata);
			//console.log(nodesToLoad);
			// Load all chunks into memory at once to avoid disk I/O during querying
			this.load(nodesToLoad);
		}
	}

	toBBox(nodes) {
		const { minX, minY, maxX, maxY } = nodes.bbox;

		return {
			minX: minX,
			minY: minY,
			maxX: maxX,
			maxY: maxY,
		};
	}

	search(bbox) {
		const chunks = super.search(bbox);
		//console.log('chunks', chunks);

		// Using a Map to track unique points
		const uniquePointsMap = new Map();

		for (const chunk of chunks) {
			for (const point of chunk.d_points) {
				if (
					point.minX >= bbox.minX &&
					point.maxX <= bbox.maxX &&
					point.minY >= bbox.minY &&
					point.maxY <= bbox.maxY
				) {
					// Create a unique key for each point, for example by using coordinates
					const key = `${point.props.Cell_ID}`;
					if (!uniquePointsMap.has(key)) {
						uniquePointsMap.set(key, point);
					}
				}
			}
		}

		console.log('uniquePointsMap from LazyRtree: ', uniquePointsMap.size);
		// If unique points are fewer than downsampleThreshold, load and downsample full data
		if (uniquePointsMap.size < this.downsampleThreshold) {
			for (const chunk of chunks) {
				var count = 0;
				const fullPoints = this.loadChunk(chunk.directory, bbox);
				// Deduplicate fullPoints if necessary, then merge with uniquePointsMap
				console.log('fullPoints from LazyRtree: ', fullPoints.length);
				fullPoints.forEach((point) => {
					const key = `${point.props.Cell_ID}`;
					if (
						point.minX >= bbox.minX &&
						point.maxX <= bbox.maxX &&
						point.minY >= bbox.minY &&
						point.maxY <= bbox.maxY
					) {
						count += 1;
						uniquePointsMap.set(key, point); // This will overwrite any duplicates
					}
				});
				console.log('point from fullpoint', count);
			}
		}

		console.log('uniquePointsMap from LazyRtree: ', uniquePointsMap.size);

		const final_points = Array.from(uniquePointsMap.values());
		if (uniquePointsMap.size < this.downsampleThreshold) {
			return final_points;
		} else {
			return this.downsample(final_points);
		}
	}

	// Method to load metadata from a JSON file
	loadMetadata(metadata) {
		if (typeof metadata === 'string') {
			const data = fs.readFileSync(metadata);
			return JSON.parse(data);
		} else {
			return metadata;
		}
	}

	downsample(data) {
		// Only downsample if the chunk exceeds the threshold
		const hilbertValues = data.map((point) =>
			this.calculateHilbertValue(point),
		);
		// Select points based on Hilbert value
		return this.selectPointsForDownsampling(data, hilbertValues);
	}
	downsampleChunk(chunk_path) {
		const chunk = this.loadChunk(chunk_path);
		//console.log(chunk.length);
		if (chunk.length > this.downsampleThreshold) {
			return this.downsample(chunk);
		}
		return [];
	}

	selectPointsForDownsampling(points, hilbertValues) {
		// Pair each point with its Hilbert value
		const pointsWithHilbert = points.map((point, index) => ({
			point,
			hilbert: hilbertValues[index],
		}));

		// Sort by Hilbert value
		pointsWithHilbert.sort((a, b) => a.hilbert - b.hilbert);

		// Select a subset of points
		const downsampled = [];
		const step = Math.ceil(points.length / this.downsampleThreshold);
		for (let i = 0; i < points.length; i += step) {
			downsampled.push(pointsWithHilbert[i].point);
		}
		//console.log('donwsampled to ', downsampled.length);
		return downsampled;
	}

	calculateHilbertValue(point) {
		const hilbertOrder = this.hilbertOrder || 16; // The resolution of the Hilbert curve

		// If the `hilbert` library expects an instance:
		const hilbertInstance = new hilbert.Hilbert2d(); // Replace `Hilbert` with the actual class name if different
		return hilbertInstance.xy2d(point.x, point.y, hilbertOrder);
	}

	loadChunk(filePath) {
		const data = fs.readFileSync(filePath);
		// Deserialize data into points (the exact implementation depends on the data format)
		const points = this.deserializeChunkData(data);
		return points;
	}

	deserializeChunkData(data) {
		const nodes = JSON.parse(data);
		// Map each node data to a new Point object, assuming the structure is compatible
		return nodes.map((node) => {
			// Parse the properties if they were stringified
			const propsObject = node.props ? JSON.parse(node.props) : {};
			// Return a new Point instance
			return new Point({
				x: node.minX,
				y: node.minY,
				// Include additional properties if present
				props: propsObject,
			});
		});
	}

	// -------------------------------------------------------
	saveLazyRtree(options = {}) {
		const { filePath = 'res/lazy_chunk.bin' } = options;
		// Convert the entire R-tree to a JSON string
		const jsonString = JSON.stringify(this.toJSON());

		// Convert the JSON string to a Buffer
		const buffer = Buffer.from(jsonString);

		// Write the buffer to the specified file path
		fs.writeFileSync(filePath, buffer);
	}

	loadLazyRtree(options = {}) {
		const { filePath = 'res/lazy_chunk.bin' } = options;
		// Read the binary file content into a buffer
		const buffer = fs.readFileSync(filePath);
		// Convert the buffer to a JSON string
		const jsonString = buffer.toString();
		// Parse the JSON string into an object
		const object = JSON.parse(jsonString);
		// Reconstruct the LazyRtree2D instance from the object
		this.fromJSON(object);
	}
}

module.exports = LazyRtree2D;

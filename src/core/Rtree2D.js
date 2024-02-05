/*
 * @Author       : Lihao usleolihao@gmail.com
 * @Date         : 2023-10-19 17:30:40
 * @FilePath     : /Visualify.cli/src/core/Rtree2D.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (usleolihao@gmail.com), All Rights Reserved.
 */
const fs = require('fs');
const path = require('path');
const RBush = require('rbush');
const Point = require('./Point');

class RTree2D extends RBush {
	constructor(options = {}) {
		const { maxEntries = 9, chunkSize = 8 * 1024 } = options;
		super(maxEntries);
		this.chunkSize = chunkSize; // default chunk size in unit bits
		this.nodeIndex = {};
	}

	toBBox(point) {
		// if Point is not instants of Point, throw error
		if (!(point instanceof Point)) {
			throw new Error('Input is not an instance of Point');
		}

		const { minX, minY, maxX, maxY } = point;

		return {
			minX: minX,
			minY: minY,
			maxX: maxX,
			maxY: maxY,
		};
	}

	saveToChunks(options = {}) {
		const { chunkSize = this.chunkSize, directory = 'res' } = options;

		const nodes = this.all(); // Get all nodes of the RTree
		let chunkIndex = 0; // Index to keep track of chunks
		let offset = 0; // Offset to slice the nodes array
		let metadataList = []; // Store metadata for each chunk
		const absolutePath = path.resolve(directory);

		while (offset < nodes.length) {
			// Define the nodes for this chunk
			const chunkNodes = nodes.slice(offset, offset + chunkSize);
			// Create a filename for the chunk
			const chunkFilename = `rtree_chunk_${chunkIndex}.bin`;

			// Save the node to the chunk
			this.saveNodeToChunk(chunkNodes, chunkFilename, absolutePath);
			// Add metadata for this chunk
			metadataList.push(
				this.createMetadata(chunkNodes, chunkFilename, absolutePath),
			);
			// Increment the chunk index and offset
			chunkIndex++;
			offset += chunkSize;
		}

		// Save metadata file
		const metadataFilename = path.join(absolutePath, 'metadata.json');
		fs.writeFileSync(
			metadataFilename,
			JSON.stringify(metadataList, null, 2),
		);
	}

	saveNodeToChunk(nodes, filename, directory) {
		// Assuming nodes is an array of Point instances
		const filepath = path.join(directory, filename);
		// Convert each Point to a JSON object including props
		const data = JSON.stringify(nodes, (key, value) =>
			key === 'props' ? JSON.stringify(value) : value,
		);
		fs.writeFileSync(filepath, data);
	}

	createMetadata(nodes, filename, directory) {
		// Calculate the bounding box for the chunk
		const bbox = nodes.reduce(
			(acc, node) => ({
				minX: Math.min(acc.minX, node.minX),
				minY: Math.min(acc.minY, node.minY),
				maxX: Math.max(acc.maxX, node.maxX),
				maxY: Math.max(acc.maxY, node.maxY),
			}),
			{
				minX: Infinity,
				minY: Infinity,
				maxX: -Infinity,
				maxY: -Infinity,
			},
		);

		// Return the metadata object for this chunk
		return {
			filename: filename,
			directory: path.join(directory, filename),
			bbox: bbox,
		};
	}

	static getRelevantChunks(range, directory = 'res') {
		const metadataFilename = path.join(directory, 'metadata.json');
		if (!fs.existsSync(metadataFilename)) {
			throw new Error('Metadata file does not exist');
		}
		const metadataList = JSON.parse(fs.readFileSync(metadataFilename));
		// Filter the chunks that overlap with the range
		return metadataList
			.filter((meta) => {
				return (
					meta.bbox.minX <= range.maxX &&
					meta.bbox.maxX >= range.minX &&
					meta.bbox.minY <= range.maxY &&
					meta.bbox.maxY >= range.minY
				);
			})
			.map((meta) => meta.filename);
	}

	// 从文件加载chunks并重建RTree
	static loadFromChunkData(filename) {
		const buffer = fs.readFileSync(filename, 'utf-8');
		const nodes = JSON.parse(buffer);
		return nodes.map((node) => {
			const propsObject = JSON.parse(node.props);
			return new Point({
				x: node.minX,
				y: node.minY,
				props: propsObject, // Assume no z-coordinate unless specified
			});
		});
	}

	static loadFromChunks(filenames) {
		const tree = new RTree2D();
		const points = [];
		for (const filename of filenames) {
			const chunkPoints = RTree2D.loadFromChunkData(filename); // Use loadFromChunkData to process each file
			points.push(...chunkPoints); // Add the points from this chunk to the array
		}

		tree.load(points);
		return tree;
	}
}

module.exports = RTree2D;

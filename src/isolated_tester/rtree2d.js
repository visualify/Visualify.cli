/*
 * @Author       : Lihao usleolihao@gmail.com
 * @Date         : 2023-10-23 14:12:39
 * @FilePath     : /Visualify.cli/src/isolated_tester/rtree2d.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (usleolihao@gmail.com), All Rights Reserved.
 */

const fs = require('fs');
const path = require('path');
const Point = require('../core/Point');
const RTree2D = require('../core/Rtree2D');
const { intersects } = require('../utils/boxes');

const createRtree2D = require('../commands/Rtree/createRtree');
/*
Key: Cell_ID, Sample Data: E80Stroma_CCAATGATCTGGGCAC-1,E113Stroma_TCTACCGTCCTGGGTG-1,E82Stroma_CTGCAGGAGCGATGGT-1,E113Stroma_AGCCAGCAGCGGTAGT-1,E80Stroma_TGAGTCACATTCCTCG-1
Key: Stage, Sample Data: E101,E80,E82,E53,E113
Key: n_UMIs, Sample Data: 5752,3226,1969,5255,4510
Key: n_Genes, Sample Data: 1830,2227,2033,2031,1652
Key: percent_MT, Sample Data: 5.8219,4.2295,5.3291,6.5631,8.2035
Key: Cell_Type, Sample Data: Glia_2_late,Glia_1_late,Cy.ENS,Glia_1_late,Glia_1_mid
Key: 2D_UMAP_1, Sample Data: 3.2891,7.2924,7.4464,-7.1723,-9.9318
Key: 2D_UMAP_2, Sample Data: -4.613,-4.3954,10.7404,-5.8843,10.6445
Key: 3D_UMAP_1, Sample Data: -5.6661,-7.1607,2.7375,-0.1849,5.105
Key: 3D_UMAP_2, Sample Data: -0.6384,1.2242,3.8112,4.8638,-0.4325
Key: 3D_UMAP_3, Sample Data: 2.1902,-1.3961,2.1101,2.064,-2.8855
*/

// creating a tree
const tree1 = new RTree2D();

const points1 = [
	new Point({
		x: 3.2891,
		y: -4.613,
		props: {
			Cell_ID: 'E80Stroma_CCAATGATCTGGGCAC-1',
			Stage: 'E80',
			Cell_Type: 'Glia_2_late',
		},
	}),
	new Point({
		x: 7.4464,
		y: -4.3954,
		props: {
			Cell_ID: 'E113Stroma_AGCCAGCAGCGGTAGT-1',
			Stage: 'E113',
			Cell_Type: 'Glia_1_mid',
		},
	}),
	new Point({
		x: 7.2924,
		y: 10.7404,
		props: {
			Cell_ID: 'E80Stroma_TGAGTCACATTCCTCG-1',
			Stage: 'E80',
			Cell_Type: 'Glia_1_late',
		},
	}),
	new Point({
		x: -7.1723,
		y: -5.8843,
		props: {
			Cell_ID: 'E113Stroma_TCTACCGTCCTGGGTG-1',
			Stage: 'E113',
			Cell_Type: 'Glia_1_late',
		},
	}),
	new Point({
		x: -9.9318,
		y: 10.6445,
		props: {
			Cell_ID: 'E82Stroma_CTGCAGGAGCGATGGT-1',
			Stage: 'E82',
			Cell_Type: 'Glia_2_late',
		},
	}),
];

tree1.load(points1);
// prints the tree data in JSON format
console.log(tree1.toJSON());

//--------------------------------------------------------------------------------------------------------------

const tree2 = createRtree2D(
	__dirname + '/../../res/ens_iter_2_metadata.json',
	null,
	null,
);

const result = tree2.search({
	minX: -7,
	minY: -5,
	maxX: -6.9,
	maxY: -4.9,
});

console.log('Basic Example Search Result:', result);

//const allItems = tree.all();
//console.log('all Items of tree', allItems);

const tree3 = new RTree2D();
tree3.load(result);

tree2.saveToChunks();
console.log('Chunks and metadata should have been created.');
// After saving chunks...
tree4 = RTree2D.loadFromChunks([__dirname + '/../../res/rtree_chunk_0.bin']);
console.log('Tree4 load from chunk', tree4.toJSON());

const searchRectangle = {
	minX: -7,
	minY: -5,
	maxX: -6.9,
	maxY: -4.9,
};

// Test if the metadata file exists and log its contents
const metadataPath = path.join(__dirname, '/../../res/');
if (fs.existsSync(metadataPath)) {
	const metadata = JSON.parse(
		fs.readFileSync(metadataPath + 'metadata.json', 'utf-8'),
	);
	console.log('Metadata:', metadata);

	// Find which chunks intersect with the search rectangle
	const relevantChunks = metadata.filter((meta) =>
		intersects(searchRectangle, meta.bbox),
	);

	// Load relevant chunks and search
	const results = [];
	for (const chunkMeta of relevantChunks) {
		// Assuming we have a method to create an R-tree from the chunk data
		const chunkTree = RTree2D.loadFromChunks([chunkMeta.directory]);

		// Perform the search query on this chunk's R-tree
		const searchResults = chunkTree.search(searchRectangle);

		// Collect the results from this chunk
		results.push(...searchResults);

		console.log('Search Results From Trunk:', results);
	}
} else {
	console.error('Metadata file was not created.');
}

/*
 * @Author       : Lihao usleolihao@gmail.com
 * @Date         : 2023-10-19 18:15:24
 * @FilePath     : /Visualify.cli/src/tester/Rtree.classes.test.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (usleolihao@gmail.com), All Rights Reserved.
 */
const path = require('path');
const fs = require('fs');
const RTree2D = require('../core/Rtree2D');
const Point = require('../core/Point');
const createRtree2D = require('../commands/Rtree/createRtree');
const { findChunk } = require('../utils/boxes');

describe('RTree2D Tests', () => {
	let tree;

	beforeEach(() => {
		// Create a new RTree2D instance before each test.
	});

	it('should add points and return JSON representation', () => {
		tree = new RTree2D();
		const points = [
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

		points.forEach((point) => {
			tree.insert(point);
		});

		const expectedJSON = {
			children: [
				{
					minX: 3.2891,
					minY: -4.613,
					minZ: null,
					maxX: 3.2891,
					maxY: -4.613,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E80Stroma_CCAATGATCTGGGCAC-1',
						Stage: 'E80',
						Cell_Type: 'Glia_2_late',
					},
				},
				{
					minX: 7.4464,
					minY: -4.3954,
					minZ: null,
					maxX: 7.4464,
					maxY: -4.3954,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E113Stroma_AGCCAGCAGCGGTAGT-1',
						Stage: 'E113',
						Cell_Type: 'Glia_1_mid',
					},
				},
				{
					minX: 7.2924,
					minY: 10.7404,
					minZ: null,
					maxX: 7.2924,
					maxY: 10.7404,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E80Stroma_TGAGTCACATTCCTCG-1',
						Stage: 'E80',
						Cell_Type: 'Glia_1_late',
					},
				},
				{
					minX: -7.1723,
					minY: -5.8843,
					minZ: null,
					maxX: -7.1723,
					maxY: -5.8843,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E113Stroma_TCTACCGTCCTGGGTG-1',
						Stage: 'E113',
						Cell_Type: 'Glia_1_late',
					},
				},
				{
					minX: -9.9318,
					minY: 10.6445,
					minZ: null,
					maxX: -9.9318,
					maxY: 10.6445,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E82Stroma_CTGCAGGAGCGATGGT-1',
						Stage: 'E82',
						Cell_Type: 'Glia_2_late',
					},
				},
			],
			height: 1,
			leaf: true,
			minX: -9.9318,
			minY: -5.8843,
			maxX: 7.4464,
			maxY: 10.7404,
		};

		expect(tree.toJSON()).toEqual(expectedJSON);
	});

	it('should search for points within a specified range', () => {
		const tree = createRtree2D(
			__dirname + '/../../res/ens_iter_2_metadata.json',
			'2D_UMAP_1',
			'2D_UMAP_2',
		);

		const searchResult = tree.search({
			minX: -7,
			minY: -5,
			maxX: -6.9,
			maxY: -4.9,
		});

		const expectedSearchResult = [
			{
				minX: -6.9274,
				minY: -4.976,
				minZ: null,
				maxX: -6.9274,
				maxY: -4.976,
				maxZ: null,
				is3D: false,
				props: {
					Cell_ID: 'E80Stroma_TTTGGAGAGGGCAAGG-1',
					Stage: 'E80',
					n_UMIs: 7214,
					n_Genes: 3239,
					percent_MT: 8.5112,
					Cell_Type: 'Neu_B_1',
				},
			},
			{
				minX: -6.9634,
				minY: -4.9654,
				minZ: null,
				maxX: -6.9634,
				maxY: -4.9654,
				maxZ: null,
				is3D: false,
				props: {
					Cell_ID: 'E80Stroma_CGAAGTTGTCGTCATA-1',
					Stage: 'E80',
					n_UMIs: 8549,
					n_Genes: 3611,
					percent_MT: 5.4392,
					Cell_Type: 'Neu_B_1',
				},
			},
		];

		// Add assertions to check the search result against the expected outcome.
		expect(searchResult).toEqual(expectedSearchResult);
	});

	it('should save and load the tree from chunks', () => {
		const bin = __dirname + '/../../res/';
		// Save the tree to chunks.
		const tree = createRtree2D(
			__dirname + '/../../res/ens_iter_2_metadata.json',
			'2D_UMAP_1',
			'2D_UMAP_2',
		);

		const searchResult = tree.search({
			minX: -7,
			minY: -5,
			maxX: -6.9,
			maxY: -4.9,
		});

		const tree2 = new RTree2D();
		tree2.load(searchResult);
		tree2.saveToChunks({ directory: bin });

		// Load a new tree from the saved chunks.
		const loadedTree = RTree2D.loadFromChunks([bin + '/rtree_chunk_0.bin']);

		// Add assertions to check the loaded tree against the expected tree.
		expect(loadedTree.toJSON()).toEqual({
			children: [
				{
					minX: -6.9274,
					minY: -4.976,
					minZ: null,
					maxX: -6.9274,
					maxY: -4.976,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E80Stroma_TTTGGAGAGGGCAAGG-1',
						Cell_Type: 'Neu_B_1',
						Stage: 'E80',
						n_Genes: 3239,
						n_UMIs: 7214,
						percent_MT: 8.5112,
					},
				},
				{
					minX: -6.9634,
					minY: -4.9654,
					minZ: null,
					maxX: -6.9634,
					maxY: -4.9654,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E80Stroma_CGAAGTTGTCGTCATA-1',
						Cell_Type: 'Neu_B_1',
						Stage: 'E80',
						n_Genes: 3611,
						n_UMIs: 8549,
						percent_MT: 5.4392,
					},
				},
			],
			height: 1,
			leaf: true,
			minX: -6.9634,
			minY: -4.976,
			maxX: -6.9274,
			maxY: -4.9654,
		});
	});

	it('should save massive data with chunks and metadata & test load and search', () => {
		const tree = createRtree2D(
			__dirname + '/../../res/ens_iter_2_metadata.json',
			'2D_UMAP_1',
			'2D_UMAP_2',
		);

		tree.saveToChunks();

		const searchRectangle = {
			minX: -7,
			minY: -5,
			maxX: -6.9,
			maxY: -4.9,
		};

		// Test if the metadata file exists and log its contents
		const metadataPath = path.join(__dirname, '/../../res/metadata.json');
		if (fs.existsSync(metadataPath)) {
			const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

			// Find which chunks intersect with the search rectangle
			const relevantChunks = findChunk(searchRectangle, metadata);

			// Load relevant chunks and search
			const results = [];
			for (const chunkMeta of relevantChunks) {
				// Assuming we have a method to create an R-tree from the chunk data
				const chunkTree = RTree2D.loadFromChunks([chunkMeta.directory]);

				// Perform the search query on this chunk's R-tree
				const searchResults = chunkTree.search(searchRectangle);

				// Collect the results from this chunk
				results.push(...searchResults);
			}

			const expectedSearchResult = [
				{
					minX: -6.9274,
					minY: -4.976,
					minZ: null,
					maxX: -6.9274,
					maxY: -4.976,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E80Stroma_TTTGGAGAGGGCAAGG-1',
						Stage: 'E80',
						n_UMIs: 7214,
						n_Genes: 3239,
						percent_MT: 8.5112,
						Cell_Type: 'Neu_B_1',
					},
				},
				{
					minX: -6.9634,
					minY: -4.9654,
					minZ: null,
					maxX: -6.9634,
					maxY: -4.9654,
					maxZ: null,
					is3D: false,
					props: {
						Cell_ID: 'E80Stroma_CGAAGTTGTCGTCATA-1',
						Stage: 'E80',
						n_UMIs: 8549,
						n_Genes: 3611,
						percent_MT: 5.4392,
						Cell_Type: 'Neu_B_1',
					},
				},
			];

			// Add assertions to check the search result against the expected outcome.
			expect(results).toEqual(expectedSearchResult);
		} else {
			console.error('Metadata file was not created.');
		}
	});
});

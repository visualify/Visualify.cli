/*
 * @Author: Lihao usleolihao@gmail.com
 * @Date: 2022-07-19 21:16:43
 * @LastEditors: Lihao Guo usleolihao@gmail.com
 * @LastEditTime: 2023-05-17 15:55:33
 * @FilePath:
 * @Description:
 * @Copyright (c) 2022 - 2023 by Lihao usleolihao@gmail.com, All Rights Reserved.
 */

// Import modules  --------------------------------------------------------------

//const { timeStamp } = require('console');
const fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path');
const ERRORMSG = require('./utils/error');
const LazyRtree2D = require('../cli/src/core/lazyRtree2D');

// get current absolute path
const getCurrentDirectoryBase = () => __dirname.toString().split('routes')[0];

const loadJSON = (path) => {
	return JSON.parse(fs.readFileSync(path).toString());
};

router.get(
	'/ncelltypes/:metabase/:cellname/:minX/:minY/:maxX/:maxY',
	function (req, res, next) {
		const bbox = {
			minX: req.params.minX,
			minY: req.params.minY,
			maxX: req.params.maxX,
			maxY: req.params.maxY,
		};

		const _cellpath = path.join(
			JSONPATH,
			req.params.metabase,
			'metadata',
			req.params.cellname,
		);

		console.log(
			`| ${'-'.repeat(90)}` +
				`\n| metabase: (${req.params.metabase}) | celltype: (${req.params.cellname})` +
				`\n| bbox: (${bbox.minX},${bbox.minY}),(${bbox.maxX},${bbox.maxY}))` +
				`\n| cell path: ${_cellpath}` +
				`\n| ${'-'.repeat(90)}`,
		);

		console.log('create lazy rtree');
		const lazyTree = new LazyRtree2D({
			downsampleThreshold: 5000,
		});

		const lazychunk = path.join(_cellpath, 'lazy_chunk.bin');

		console.log('load lazy rtree: ' + lazychunk);
		lazyTree.loadLazyRtree({ filePath: lazychunk });

		console.log('load lazy rtree done');

		const Search_result = lazyTree.search(bbox);
		console.log('search done, result length:' + Search_result.length);

		const CELL_ID_MAP = loadJSON(
			path.join(_cellpath, 'Cell_ID_Mapping.json'),
		); //loadJSON(_cellpath + 'Cell_ID_Mapping.json');
		const CELL_TYPE_MAP = loadJSON(
			path.join(_cellpath, 'Cell_Type_Mapping.json'),
		); //loadJSON(_cellpath + 'Cell_Type_Mapping.json');
		const Stage_MAP = loadJSON(path.join(_cellpath, 'Stage_Mapping.json')); //loadJSON(_cellpath + 'Stage_Mapping.json');

		const groupedProperties = {};

		Search_result.forEach((point) => {
			if (
				!groupedProperties['2D_UMAP_1'] ||
				!groupedProperties['2D_UMAP_2']
			) {
				groupedProperties['2D_UMAP_1'] = [];
				groupedProperties['2D_UMAP_2'] = [];
			}

			groupedProperties['2D_UMAP_1'].push(point.minX);
			groupedProperties['2D_UMAP_2'].push(point.minY);
			for (const propName in point.props) {
				//groupedProperties[propName].push(point.props[propName]);
				if (!groupedProperties[propName]) {
					groupedProperties[propName] = [];
				}
				if (propName === 'Cell_ID') {
					groupedProperties[propName].push(
						CELL_ID_MAP[point.props[propName]],
					);
				} else if (propName === 'Cell_Type') {
					groupedProperties[propName].push(
						CELL_TYPE_MAP[point.props[propName]],
					);
				} else if (propName === 'Stage') {
					groupedProperties[propName].push(
						Stage_MAP[point.props[propName]],
					);
				} else {
					groupedProperties[propName].push(point.props[propName]);
				}
			}
		});

		console.log(
			`| lazychunk at ${lazychunk}` +
				`\n| Lazytree loaded ${lazyTree.toJSON()}` +
				`\n| Search for (${bbox.minX},${bbox.minY}),(${bbox.maxX},${bbox.maxY}))` +
				`\n| Found result: ${Search_result.length}` +
				`\n| ${'-'.repeat(90)}`,
		);
        
		if (!groupedProperties) {
			res.send({
				code: 500,
				cmd: 'metadata',
				message: 'Failed to get cell',
				error: ERRORMSG[err.code],
			});
		} else {
			res.send({
				code: 200,
				cmd: 'metadata',
				message: 'Successfully get cell',
				metadata: groupedProperties,
			});
		}
	},
);

module.exports = router;
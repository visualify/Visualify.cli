/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-05 12:05:36
 * @FilePath     : /Visualify.cli/src/isolated_tester/lazyrtree2d.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const fs = require('fs');
const path = require('path');
const LazyRtree2D = require('../core/lazyRtree2D');

const metadataPath = path.join(__dirname, '/../../res/metadata.json');

const lazyTree = new LazyRtree2D({
	downsampleThreshold: 1000,
	metadata: metadataPath,
});

console.log(lazyTree.toJSON());

const searchRectangle = {
	minX: -7,
	minY: -5,
	maxX: -1,
	maxY: -1,
};

const Search_result = lazyTree.search(searchRectangle);

console.log(Search_result.length);

lazyTree.saveLazyRtree();
lazyTree.loadLazyRtree();

const searchRectangle2 = {
	minX: -5,
	minY: -3,
	maxX: 5,
	maxY: -1,
};

const Search_result2 = lazyTree.search(searchRectangle2);
console.log(Search_result2.length);

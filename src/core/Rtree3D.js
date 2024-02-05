/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-04 12:48:01
 * @FilePath     : /Visualify.cli/src/core/Rtree3D.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const { RBush3D } = require('rbush-3d');

class Rtree3D extends RBush3D {
	constructor(maxEntries = 9) {
		super(maxEntries);
		// Add any custom initialization if needed
	}
}

module.exports = Rtree3D;

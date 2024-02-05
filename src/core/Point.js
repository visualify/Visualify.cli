/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-04 12:48:48
 * @FilePath     : /Visualify.cli/src/core/Point.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
class Point {
	constructor({ x, y, z = null, props = {} }) {
		this.minX = x;
		this.minY = y;
		this.minZ = z;
		this.maxX = x;
		this.maxY = y;
		this.maxZ = z;
		this.is3D = z !== null;
		this.props = props;
	}

	setProperty(key, value) {
		this.props[key] = value;
	}

	getProperty(key) {
		return this.props[key];
	}

	insertIntoRtree(tree) {
		tree.insert(this);
	}
}

module.exports = Point;

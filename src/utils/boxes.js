/*
 * @Author       : Lihao usleolihao@gmail.com
 * @Date         : 2023-10-19 11:21:57
 * @FilePath     : /Visualify.cli/src/utils/boxes.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (usleolihao@gmail.com), All Rights Reserved.
 */

// Function to check if the search rectangle intersects the bounding box
function intersects(searchRect, bbox) {
	return (
		searchRect.minX <= bbox.maxX &&
		searchRect.maxX >= bbox.minX &&
		searchRect.minY <= bbox.maxY &&
		searchRect.maxY >= bbox.minY
	);
}

function findChunk(searchRectangle, metadata) {
	return metadata.filter((meta) => intersects(searchRectangle, meta.bbox));
}

module.exports = {
	intersects,
	findChunk,
};

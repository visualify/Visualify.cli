#!/usr/bin/env node
/*
 * @Author       : Lihao usleolihao@gmail.com
 * @Date         : 2023-10-19 10:56:50
 * @FilePath     : /Visualify.cli/src/visualify.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (usleolihao@gmail.com), All Rights Reserved.
 */

const program = require('commander');
const loadJson = require('./commands/Rtree/loadJson');
const createRtree2D = require('./commands/Rtree/createRtree');
const saveMapping = require('./commands/Rtree/mapping');
// Include the command modules
const initCommand = require('./commands/init');
const serveCommand = require('./commands/serve');
const startCommand = require('./commands/start');

program
	.version('1.0.0')
	.description('CLI toolkit for visualify.js R-tree management');

// Define and add init and serve commands
program
	.command('init [path]')
	.description('Create new documentation')
	.action(initCommand);

program
	.command('serve [path]')
	.description('Run local server to preview site')
	.action(serveCommand);

program
	.command('start [path]')
	.description('Start a web server to serve the specified path')
	.action(startCommand);

// Define and add R-tree management commands
program
	.command('load-json <path>')
	.description('Load points from JSON file')
	.action(loadJson);

program
	.command('mapping <path>')
	.option('-s, --saved-path <saved_path>', 'Specify the saved path')
	.option('-k, --keys <keys...>', 'Specify the keys to be used for mapping')
	.description('Create a mapping with optional keys')
	.action(saveMapping);

program
	.command('rtree2d <path>')
	.option('-x, --x <x>', 'Specify the value for x')
	.option('-y, --y <y>', 'Specify the value for y')
	.option('-s, --saved-path <savedPath>', 'Specify the saved path')
	.option(
		'-t, --threshold <threshold>',
		'Specify the threshold for lazy R-tree',
	)
	.option('-dir, --directory', 'Process the directory of files')
	.option('-r, --router', 'Create a router for the R-tree')
	.option(
		'-m, --mapping <keys...>',
		'Specify the keys to be used for mapping',
	)
	.description('Create a 2D R-tree')
	.action(createRtree2D);

// Parse command-line arguments
program.parse(process.argv);

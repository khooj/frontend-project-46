#!/usr/bin/env node

import fs from 'fs';
import { Command } from 'commander';
import { genDiff } from './../src/diff.js';

const program = new Command();
program
	.name('gendiff')
	.description('Compares two configuration files and shows a difference.')
	.version('0.0.1')
	.option('-f, --format <type>', 'output format')
	.argument('<filepath1>')
	.argument('<filepath2>')
	.action((filepath1, filepath2) => {
		const file1 = JSON.parse(fs.readFileSync(filepath1, 'utf8'));
		const file2 = JSON.parse(fs.readFileSync(filepath2, 'utf8'));
		const result = genDiff(file1, file2);
		console.log(result);
	});

program.parse();

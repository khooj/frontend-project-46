#!/usr/bin/env node

import { Command } from 'commander';
import genDiff from '../src/diff.js';
import parseFile from '../src/parsers/parse.js';

const program = new Command();
program
  .name('gendiff')
  .description('Compares two configuration files and shows a difference.')
  .version('0.0.1')
  .argument('<filepath1>')
  .argument('<filepath2>')
  .option('-f, --format <type>', 'output format', 'stylish')
  .action((filepath1, filepath2, options) => {
    const obj1 = parseFile(filepath1);
    const obj2 = parseFile(filepath2);
    if (obj1 === null || obj2 === null) {
      console.log('Only json and yaml format supported');
      process.exit(-1);
    }

    console.log(genDiff(obj1, obj2, options.format));
  });

program.parse();

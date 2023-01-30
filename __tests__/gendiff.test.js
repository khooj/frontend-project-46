import path, { dirname } from 'path';
import { test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import genDiff from '../src/diff.js';
import parse from '../src/parsers/parse.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const base = path.join(__dirname, '..', '__fixtures__');

const expectedOutput = fs.readFileSync(path.join(base, 'result.txt'), 'utf8');

// test('diff', () => {
//   const obj1 = {
//     key1: 'val1',
//     key2: 10,
//     key3: {
//       key1: 'val2',
//       key2: 20,
//       key3: {
//         key1: 'val3',
//         key2: null,
//       }
//     },
//     key4: {
//       key1: 10,
//     },
//   };

//   const obj2 = {
//     key1: 'val1',
//     key2: 30,
//     key3: {
//       key1: 'val2',
//       key2: 10,
//       key3: {
//         key1: 'val10',
//       },
//       key4: {
//         key2: 15
//       }
//     }
//   };
//   console.log(diff(obj1, obj2));
// });

test('gendiff', () => {
  const file1 = path.join(base, 'file1.json');
  const file2 = path.join(base, 'file2.json');

  const obj1 = parse(file1);
  const obj2 = parse(file2);

  const result = genDiff(obj1, obj2);
  console.log(result);
  expect(result).toBe(expectedOutput);
});

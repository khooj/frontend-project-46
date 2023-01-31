import path, { dirname } from 'path';
import { test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import fs from 'fs';
import genDiff from '../src/diff.js';
import parse from '../src/parsers/parse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const base = path.join(__dirname, '..', '__fixtures__');

const expectedOutput = fs.readFileSync(path.join(base, 'result.txt'), 'utf8');

test('gendiff json', () => {
  const file1 = path.join(base, 'file1.json');
  const file2 = path.join(base, 'file2.json');

  const obj1 = parse(file1);
  const obj2 = parse(file2);

  const result = genDiff(obj1, obj2);
  expect(result).toBe(expectedOutput);
});

test('gendiff yaml', () => {
  const file1 = path.join(base, 'file1.yml');
  const file2 = path.join(base, 'file2.yaml');

  const obj1 = parse(file1);
  const obj2 = parse(file2);

  const result = genDiff(obj1, obj2);
  expect(result).toBe(expectedOutput);
});

test('gendiff wrong formatter', () => {
  const file1 = path.join(base, 'file1.yml');
  const file2 = path.join(base, 'file2.yaml');

  const obj1 = parse(file1);
  const obj2 = parse(file2);

  expect(() => genDiff(obj1, obj2, 'default')).toThrowError();
});

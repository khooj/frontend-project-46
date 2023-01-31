import path, { dirname } from 'path';
import { test, expect, beforeEach } from '@jest/globals';
import { fileURLToPath } from 'url';
import fs from 'fs';
import genDiff from '../src/diff.js';
import parse from '../src/parsers/parse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const base = path.join(__dirname, '..', '__fixtures__');

const expectedOutput = fs.readFileSync(path.join(base, 'result.txt'), 'utf8');
const expectedPlainOutput = fs.readFileSync(path.join(base, 'result_plain.txt'), 'utf8');
let obj1; let
  obj2;

beforeEach(() => {
  const file1 = path.join(base, 'file1.json');
  const file2 = path.join(base, 'file2.json');

  obj1 = parse(file1);
  obj2 = parse(file2);
});

test('gendiff json', () => {
  const result = genDiff(obj1, obj2, 'stylish');
  expect(result).toBe(expectedOutput);
});

test('gendiff yaml', () => {
  const result = genDiff(obj1, obj2, 'stylish');
  expect(result).toBe(expectedOutput);
});

test('gendiff wrong formatter', () => {
  expect(() => genDiff(obj1, obj2, 'default')).toThrow();
});

test('gendiff plain', () => {
  const result = genDiff(obj1, obj2, 'plain');
  expect(result).toBe(expectedPlainOutput);
});

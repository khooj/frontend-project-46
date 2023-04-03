import path, { dirname } from 'path';
import { test, expect, beforeEach } from '@jest/globals';
import { fileURLToPath } from 'url';
import fs from 'fs';
import genDiff from '../src/diff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const base = path.join(__dirname, '..', '__fixtures__');

const expectedOutput = fs.readFileSync(path.join(base, 'result.txt'), 'utf8');
const expectedPlainOutput = fs.readFileSync(path.join(base, 'result_plain.txt'), 'utf8');
let file1; let
  file2;

beforeEach(() => {
  file1 = path.join(base, 'file1.json');
  file2 = path.join(base, 'file2.json');
});

test('gendiff json', () => {
  const result = genDiff(file1, file2, 'stylish');
  expect(result).toBe(expectedOutput);
});

test('gendiff yaml', () => {
  const result = genDiff(file1, file2, 'stylish');
  expect(result).toBe(expectedOutput);
});

test('gendiff plain', () => {
  const result = genDiff(file1, file2, 'plain');
  expect(result).toBe(expectedPlainOutput);
});

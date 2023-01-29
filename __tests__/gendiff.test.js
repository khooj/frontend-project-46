import path, { dirname } from 'path';
import { test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import genDiff from '../src/diff.js';
import parse from '../src/parsers/parse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const base = path.join(__dirname, '..', '__fixtures__');

test('gendiff', () => {
  const file1 = path.join(base, 'file1.json');
  const file2 = path.join(base, 'file2.yaml');

  const obj1 = parse(file1);
  const obj2 = parse(file2);

  const result = genDiff(obj1, obj2);
  expect(result).toBe(`{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}`);
});

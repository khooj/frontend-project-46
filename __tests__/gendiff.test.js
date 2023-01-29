import genDiff from "../src/diff.js";
import fs from 'fs';
import path from 'path';
import { test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadFixtures = () => {
  const base = path.join(__dirname, '..', '__fixtures__');
  const file1 = path.join(base, 'file1.json');
  const file2 = path.join(base, 'file2.json');
  const obj1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
  const obj2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
  return [obj1, obj2];
};

let obj1, obj2;

beforeEach(() => {
  const [o1, o2] = loadFixtures();
  obj1 = o1;
  obj2 = o2;
});

test('main flow', () => {
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

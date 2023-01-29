import { expect, test } from '@jest/globals';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { isJSON, parseJSON } from '../src/parsers/json.js';
import { isYAML, parseYAML } from '../src/parsers/yaml.js';
import selectParser from '../src/parsers/parse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const base = path.join(__dirname, '..', '__fixtures__');

test('json', () => {
  const file1 = path.join(base, 'file1.json');
  expect(isJSON(file1)).toBe(true);

  const obj1 = parseJSON(file1);
  expect(obj1).toEqual({
    host: 'hexlet.io',
    timeout: 50,
    proxy: '123.234.53.22',
    follow: false,
  });
});

test('yaml', () => {
  const file1 = path.join(base, 'file1.yml');
  const file2 = path.join(base, 'file2.yaml');
  expect(isYAML(file1)).toBe(true);
  expect(isYAML(file2)).toBe(true);

  const obj1 = parseYAML(file1);
  expect(obj1).toEqual({
    host: 'hexlet.io',
    timeout: 50,
    proxy: '123.234.53.22',
    follow: false,
  });
});

test('select_parser', () => {
  const file1 = path.join(base, 'file1.json');
  const obj1 = selectParser(file1);
  expect(obj1).toEqual({
    host: 'hexlet.io',
    timeout: 50,
    proxy: '123.234.53.22',
    follow: false,
  });

  const file2 = path.join(base, 'file1.yml');
  const obj2 = selectParser(file2);
  expect(obj2).toEqual({
    host: 'hexlet.io',
    timeout: 50,
    proxy: '123.234.53.22',
    follow: false,
  });
});

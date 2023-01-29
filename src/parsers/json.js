import fs from 'fs';

const parseJSON = (filepath) => {
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
};

const isJSON = (filepath) => filepath.endsWith('.json');

export {
  parseJSON,
  isJSON,
};

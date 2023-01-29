import fs from 'fs';
import yaml from 'js-yaml';

const parseYAML = (filepath) => {
  return yaml.load(fs.readFileSync(filepath, 'utf8'));
};

const isYAML = (filepath) => ['yml', 'yaml'].includes(filepath.split('.').at(-1));

export {
  parseYAML,
  isYAML,
};

import stylish from './stylish.js';
import plain from './plain.js';
import json from './json.js';

export default (format) => {
  switch (format) {
    case 'plain': return plain;
    case 'json': return json;
    case 'stylish':
    default:
      return stylish;
  }
};

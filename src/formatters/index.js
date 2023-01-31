import stylish from './stylish.js';
import plain from './plain.js';

export default (format) => {
  switch (format) {
    case 'stylish': return stylish;
    case 'plain': return plain;
    default:
      throw new Error(`unsupported format: ${format}`);
  }
};

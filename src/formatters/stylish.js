const getSymbol = (type) => {
  switch (type) {
    case 'equal': return ' ';
    case 'first': return '-';
    case 'second': return '+';
    default: return 'ERR';
  }
};

const identStep = 4;

const stylish = (diffs) => {
  const iter = (el, identSize, parentType = null) => {
    switch (el.element) {
      case 'primitive':
        return `${' '.repeat(identSize - 2)}${getSymbol(el.type)} ${parentType === 'array' ? '' : `${el.key}: `}${el.value}`;
      case 'object':
        return [
          `${' '.repeat(identSize - 2)}${getSymbol(el.type)} ${el.key}: {`,
          ...el.value.flatMap((el2) => iter(el2, identSize + identStep)),
          `${' '.repeat(identSize)}}`,
        ].join('\n');
      case 'array':
        return [
          `${' '.repeat(identSize - 2)}${getSymbol(el.type)} ${el.key}: [`,
          ...el.value.flatMap((el2) => iter(el2, identSize + identStep, 'array')),
          `${' '.repeat(identSize)}]`,
        ].join('\n');
      default:
        throw new Error(`unsupported tree type: ${el.element}`);
    }
  };
  const result = diffs.flatMap((el) => iter(el, identStep));

  return ['{', ...result, '}'].join('\n');
};

export default stylish;

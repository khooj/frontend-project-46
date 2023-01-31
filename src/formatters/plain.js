const groupByFirst = (acc, el) => {
  const k = el.key;
  acc[k] = acc[k] ?? el;
  if (acc[k].type === 'first' && el.type === 'second') {
    acc[k].second = el;
  }
  return acc;
};

const mergeFirstSecond = diffs => {
  // console.log(diffs.reduce(groupByFirst, {}));
  const result = Object.values(diffs.reduce(groupByFirst, {})).map(el => {
    if (['object', 'array'].includes(el.element)) {
      return {
        ...el,
        value: mergeFirstSecond(el.value),
      };
    }

    return el;
  });

  // console.log(result);
  return Object.values(result);
};

const plain = (diffs) => {
  const iter = (el, parentPath) => {
    switch (el.element) {
      case 'primitive':
        let op;
        switch (el.type) {
          case 'first':
            op = `was removed`;
            if (el.second) {
              op = `was updated. From ${el.value} to ${el.second.value}`;
            }
            break
          case 'second':
            op = `was added with value: ${el.value}`;
            break
          case 'equal':
            return null;
          default:
            throw new Error(`unsupported tree type: ${el.type}`);
        }
        return `Property '${parentPath === '' ? '' : parentPath + '.'}${el.key}' ${op}`;
      case 'object':
      case 'array':
        const r = mergeFirstSecond(el.value);
        return r.flatMap(el2 => iter(el2, `${parentPath}${el.key}`));
      default:
        throw new Error(`unsupported tree type: ${el.element}`);
    }
  };

  // console.log(mergeFirstSecond(diffs), null, 2);
  return mergeFirstSecond(diffs).flatMap(el => iter(el, '')).join('\n');
};

export default plain;

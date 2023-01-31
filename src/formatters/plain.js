const groupByFirst = (acc, el) => {
  const k = el.key;
  acc[k] = acc[k] ?? el;
  if (acc[k].type === 'first' && el.type === 'second') {
    acc[k].second = el;
  }
  return acc;
};

const mergeFirstSecond = diffs => {
  const result = Object.values(diffs.reduce(groupByFirst, {})).map(el => {
    if (['object', 'array'].includes(el.element)) {
      return {
        ...el,
        value: mergeFirstSecond(el.value),
      };
    }

    return el;
  });

  return Object.values(result);
};

const isComplexObject = node => ['object', 'array'].includes(node.element);
const formatValue = elem => {
  if (elem.element === 'primitive') {
    if (typeof (elem.value) === 'string') {
      return `'${elem.value}'`;
    } else {
      return `${elem.value}`;
    }
  }
  if (isComplexObject(elem)) {
    return '[complex value]';
  }
  throw new Error(`unsupported node type: ${elem.element}`);
};

const formatKey = (el, parentType) => {
  if (parentType === 'array') {
    return `[${el.key}]`;
  }
  return `${el.key}`;
};

const plain = (diffs) => {
  const iter = (el, parentPath, parentType) => {
    switch (el.element) {
      case 'primitive':
        let op;
        switch (el.type) {
          case 'first':
            op = `was removed`;
            if (el.second) {
              op = `was updated. From ${formatValue(el)} to ${formatValue(el.second)}`;
            }
            break
          case 'second':
            op = `was added with value: ${formatValue(el)}`;
            break
          case 'equal':
            return null;
          default:
            throw new Error(`unsupported tree type: ${el.type}`);
        }
        return `Property '${parentPath}${formatKey(el, parentType)}' ${op}`;
      case 'object':
      case 'array':
        if (el.type === 'second') {
          return `Property '${parentPath}${formatKey(el, parentType)}' was added with value: [complex value]`;
        }
        if (el.type === 'first' && el.second) {
          return `Property '${parentPath}${formatKey(el, parentType)}' was updated. From ${formatValue(el)} to ${formatValue(el.second)}`;
        }
        if (el.type === 'first' && !el.second) {
          return `Property '${parentPath}${formatKey(el, parentType)}' was removed`;
        }

        const r = mergeFirstSecond(el.value);
        return r.flatMap(el2 => iter(el2, `${parentPath}${formatKey(el, parentType)}.`, el.element));
      default:
        throw new Error(`unsupported tree type: ${el.element}`);
    }
  };

  return mergeFirstSecond(diffs).flatMap(el => iter(el, '', '')).filter(el => !!el).join('\n');
};

export default plain;

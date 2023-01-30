const comparePrimitiveValues = (key, val1, val2) => {
  const contains1 = val1 !== undefined;
  const contains2 = val2 !== undefined;
  if (contains1 && !contains2) {
    return [{ type: 'first', key, value: val1 }];
  } else if (!contains1 && contains2) {
    return [{ type: 'second', key, value: val2 }];
  } else if (contains1 && contains2) {
    if (val1 === val2) {
      return [{ type: 'equal', key, value: val1 }];
    } else {
      return [
        { type: 'first', key, value: val1 },
        { type: 'second', key, value: val2 },
      ];
    }
  }
  return [];
};

const diff = (parentKey, obj1, obj2) => {
  const isArray = obj1 instanceof Array;
  const isObj = obj1 instanceof Object;

  if (!(isArray || isObj)) {
    return comparePrimitiveValues(parentKey, obj1, obj2);
  }

  console.log(parentKey, obj1, obj2);
  const keysSet = new Set([Object.keys(obj1), Object.keys(obj2)].flat());
  const keys = [...keysSet].sort((a, b) => a.normalize().localeCompare(b.normalize()));

  const result = keys.map((key) => {
    const contains1 = Object.hasOwn(obj1, key);
    const contains2 = Object.hasOwn(obj2, key);

    if (contains1 && !contains2) {
      return {
        type: 'first',
        key,
        value: diff(key, obj1[key], obj2[key]),
      };
    } else if (!contains1 && contains2) {
      return {
        type: 'second',
        key,
        value: diff(key, obj1[key], obj2[key]),
      };
    } else if (contains1 && contains2) {
      return {
        type: 'equal',
        key,
        value: diff(key, obj1[key], obj2[key]),
      };
    }

    return [];
  });

  return result;
};

// possible compares
// object object
// object primitive
// object array
// object undefined
// primitive primitive
// primitive array
// primitive undefined
// array array
// array undefined

const makeMetaTree = obj => {
  const result = Object.keys(obj).map((key) => {
    let t = 'primitive';
    let v = obj[key];
    if (obj[key] instanceof Object) {
      t = 'object';
      v = makeMetaTree(obj[key]);
    }
    if (obj[key] instanceof Array) {
      t = 'array';
      v = makeMetaTree(obj[key]);
    }
    return {
      type: t,
      key,
      value: v,
    };
  });
  return result;
};

const getByKey = (tree, key) => tree.find(el => el.key === key);
const diffElement = (type, { type: element, key, value }) => ({ type, element, key, value });

const diff2 = (obj1, obj2) => {
  // [
  // если сравнение object-object
  //   { type: equal, key, value: [ 
  //     { type: first, key, value: val1 },
  //     ...
  //   ]},
  // если сравнение object-primitive
  //   { type: first, key, value: [ { type: equal, key, value } ] }, // т.е. все внутренние ключи должны отобразиться без плюса/минуса, так же и для second
  //   { type: second, key, value: primitive },
  // если сравнение object-array - аналогично object-primitive
  // если object-undefined, то как object-primitive, только без second для primitive
  // если primitive-primitive, 
  //   { type: first, key, value: val1 }, // если есть только в первом или если неравны
  //   { type: second, key, value: val2 }, // если есть только во втором или неравны
  //   { type: equal, key, value: val2 }, // если есть и там и там и равны
  // если primitive-array, то first для primitive и second для array с equal внутри
  // если array-array
  //   { type: equal, key, value: [ type: first/second, key, value ] }, // т.е. внутренности сравниваются как и object, только ключи - индексы
  // ]

  // expects { type: primitive/array/object, key, value }
  const compare = (subtree1, subtree2) => {
    // console.log(JSON.stringify(subtree1, null, 2));
    if (subtree1 === undefined) {
      switch (subtree2.type) {
        case 'primitive':
          return [diffElement('second', subtree2)];
        case 'array':
        case 'object':
          return [diffElement(
            'second',
            { ...subtree2, value: subtree2.value.flatMap(el => compare(el, el)) }
          )];
      }
    }
    switch (subtree1.type) {
      case 'primitive':
        if (subtree2 === undefined) {
          return [diffElement('first', subtree1)];
        }
        switch (subtree2.type) {
          case 'primitive':
            if (subtree1.value === subtree2.value) {
              return [diffElement('equal', subtree1)];
            } else {
              return [diffElement('first', subtree1), diffElement('second', subtree2)];
            }
          case 'array':
          case 'object':
            return [
              diffElement('first', subtree1),
              diffElement('second', { ...subtree2, value: subtree2.value.flatMap(el => compare(el, el)) }),
            ];
        }
        break
      case 'array':
      case 'object':
        if (subtree2 === undefined) {
          return [diffElement(
            'first',
            { ...subtree1, value: subtree1.value.flatMap(el => compare(el, el)) },
          )];
        }
        switch (subtree2.type) {
          case 'primitive':
            return [
              diffElement('first', { ...subtree1, value: subtree1.value.flatMap(el => compare(el, el)) }),
              diffElement('second', subtree2),
            ];
          case 'array':
          case 'object':
            return [diffElement(
              'equal',
              { ...subtree1.value.flatMap(el => compare(el, getByKey(subtree2.value, el.key))) },
            )];
        }
    }
    // return null;
  };

  // const iter = (subtree1, subtree2) => {
  //   subtree1.map((el) => {
  //     const el2 = getByKey(subtree2, el.key);
  //   })
  // };

  const tree1 = makeMetaTree(obj1);
  const tree2 = makeMetaTree(obj2);
  // console.log(JSON.stringify(tree1, null, 2));
  // console.log(JSON.stringify(tree2, null, 2));

  const result1 = tree1.flatMap(el => compare(el, getByKey(tree2, el.key)));
  const result2 = tree2.filter(el => !!tree1.find((el2) => el2.key === el.key)).flatMap(el => compare(undefined, el));
  return result1.concat(result2);
};

const getSymbol = type => {
  switch (type) {
    case 'equal': return ' ';
    case 'first': return '+';
    case 'second': return '-';
    default: return 'ERR';
  }
};

const identStep = 4;

const genDiff = (obj1, obj2) => {
  const diffs = diff2(obj1, obj2);
  return JSON.stringify(diffs, null, 2);

  const iter = (el, identSize) => {
    switch (el.element) {
      case 'primitive':
        return `${' '.repeat(identSize - 2)}${getSymbol(el.type)} ${el.key}: ${el.value}`;
      case 'object':
        return [
          ' '.repeat(identSize - 2) + `${getSymbol(el.type)} ${el.key}: {`,
          ...el.value.flatMap(el => iter(el, identSize + identStep)),
          ' '.repeat(identSize) + '}',
        ].join('\n');
      case 'array':
        return [
          ' '.repeat(identSize - 2) + `${getSymbol(el.type)} ${el.key}: [`,
          ...el.value.flatMap(el => iter(el, identSize + identStep)),
          ' '.repeat(identSize) + '}',
        ].join('\n');
    }
  };
  const result = diffs.flatMap(el => iter(el, identStep));

  return ['{', ...result, '}'].join('\n');
};

export default genDiff;

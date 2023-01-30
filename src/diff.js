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
const getUniqueElementsFromSecondSubtree = (tree1, tree2) => tree2.filter(el => !tree1.find(el2 => el2.key == el.key));
const sortElements = tree => tree.sort((a, b) => a.key.normalize().localeCompare(b.key.normalize()));

const diff = (obj1, obj2) => {
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

  const compare = (subtree1, subtree2) => {
    if (subtree1 === undefined) {
      switch (subtree2.type) {
        case 'primitive':
          return [diffElement('second', subtree2)];
        case 'array':
        case 'object':
          return [diffElement(
            'second',
            { ...subtree2, value: sortElements(subtree2.value.flatMap(el => compare(el, el))) }
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
              diffElement('second', { ...subtree2, value: sortElements(subtree2.value.flatMap(el => compare(el, el))) }),
            ];
        }
        break
      case 'array':
      case 'object':
        if (subtree2 === undefined) {
          return [diffElement(
            'first',
            { ...subtree1, value: sortElements(subtree1.value.flatMap(el => compare(el, el))) },
          )];
        }
        switch (subtree2.type) {
          case 'primitive':
            return [
              diffElement('first', { ...subtree1, value: sortElements(subtree1.value.flatMap(el => compare(el, el))) }),
              diffElement('second', subtree2),
            ];
          case 'array':
          case 'object':
            return [diffElement(
              'equal',
              {
                ...subtree1,
                value: sortElements(subtree1.value
                  .flatMap(el => compare(el, getByKey(subtree2.value, el.key)))
                  .concat(
                    getUniqueElementsFromSecondSubtree(subtree1.value, subtree2.value)
                      .flatMap(el => compare(undefined, el))
                  ),
                ),
              },
            )];
        }
    }
  };

  const tree1 = makeMetaTree(obj1);
  const tree2 = makeMetaTree(obj2);

  const result1 = tree1.flatMap(el => compare(el, getByKey(tree2, el.key)));
  const result2 = getUniqueElementsFromSecondSubtree(tree1, tree2).flatMap(el => compare(undefined, el));
  return sortElements(result1.concat(result2));
};

const getSymbol = type => {
  switch (type) {
    case 'equal': return ' ';
    case 'first': return '-';
    case 'second': return '+';
    default: return 'ERR';
  }
};

const identStep = 4;

const genDiff = (obj1, obj2) => {
  const diffs = diff(obj1, obj2);

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

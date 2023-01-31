import stylish from './formatters/stylish.js';
import plain from './formatters/plain.js';

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

const makeMetaTree = (obj) => {
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

const getByKey = (tree, key) => tree.find((el) => el.key === key);
const diffElement = (type, { type: element, key, value }) => ({
  type, element, key, value,
});
const uniquesFromSecondTree = (t1, t2) => t2.filter((el) => !t1.find((el2) => el2.key === el.key));
const sortPredicate = (a, b) => a.key.normalize().localeCompare(b.key.normalize());

const diff = (obj1, obj2) => {
  // [
  // если сравнение object-object
  //   { type: equal, key, value: [
  //     { type: first, key, value: val1 },
  //     ...
  //   ]},
  // если сравнение object-primitive
  // т.е. все внутренние ключи должны отобразиться без плюса/минуса, так же и для second
  //   { type: first, key, value: [ { type: equal, key, value } ] },
  //   { type: second, key, value: primitive },
  // если сравнение object-array - аналогично object-primitive
  // если object-undefined, то как object-primitive, только без second для primitive
  // если primitive-primitive,
  //   { type: first, key, value: val1 }, // если есть только в первом или если неравны
  //   { type: second, key, value: val2 }, // если есть только во втором или неравны
  //   { type: equal, key, value: val2 }, // если есть и там и там и равны
  // если primitive-array, то first для primitive и second для array с equal внутри
  // если array-array
  // т.е. внутренности сравниваются как и object, только ключи - индексы
  //   { type: equal, key, value: [ type: first/second, key, value ] },
  // ]

  const returnRecursiveElement = (type, tree) => diffElement(
    type,
    // нельзя пофиксить ошибку линтера без переработки логики и увеличения копипасты.
    // eslint-disable-next-line no-use-before-define
    { ...tree, value: tree.value.flatMap((el) => compare(el, el)).sort(sortPredicate) },
  );

  const returnUncheckedElement = (type, tree) => {
    switch (tree.type) {
      case 'primitive':
        return [diffElement(type, tree)];
      case 'array':
      case 'object':
        return [returnRecursiveElement(type, tree)];
      default:
        throw new Error(`unsupported type: ${tree.type}`);
    }
  };

  const compare = (subtree1, subtree2) => {
    if (subtree1 === undefined) {
      return returnUncheckedElement('second', subtree2);
    }
    if (subtree2 === undefined) {
      return returnUncheckedElement('first', subtree1);
    }

    switch (subtree1.type) {
      case 'primitive':
        switch (subtree2.type) {
          case 'primitive':
            if (subtree1.value === subtree2.value) {
              return [diffElement('equal', subtree1)];
            }
            return [diffElement('first', subtree1), diffElement('second', subtree2)];

          case 'array':
          case 'object':
            return [
              diffElement('first', subtree1),
              returnRecursiveElement('second', subtree2),
            ];
          default:
            throw new Error(`unsupported tree type: ${subtree2.type}`);
        }
      case 'array':
      case 'object':
        switch (subtree2.type) {
          case 'primitive':
            return [
              returnRecursiveElement('first', subtree1),
              diffElement('second', subtree2),
            ];
          case 'array':
          case 'object':
            return [diffElement(
              'equal',
              {
                ...subtree1,
                value: subtree1.value
                  .flatMap((el) => compare(el, getByKey(subtree2.value, el.key)))
                  .concat(
                    uniquesFromSecondTree(subtree1.value, subtree2.value)
                      .flatMap((el) => compare(undefined, el)),
                  )
                  .sort(sortPredicate),
              },
            )];
          default:
            throw new Error(`unsupported tree type: ${subtree2.type}`);
        }
      default:
        throw new Error(`unsupported tree type: ${subtree1.type}`);
    }
  };

  const tree1 = makeMetaTree(obj1);
  const tree2 = makeMetaTree(obj2);

  const result1 = tree1.flatMap((el) => compare(el, getByKey(tree2, el.key)));
  const result2 = uniquesFromSecondTree(tree1, tree2).flatMap((el) => compare(undefined, el));
  return result1.concat(result2).sort(sortPredicate);
};

const genDiff = (obj1, obj2, formatter = 'stylish') => {
  const diffs = diff(obj1, obj2);
  switch (formatter) {
    case 'stylish': return stylish(diffs);
    case 'plain': return plain(diffs);
    default: throw new Error('formatter not supported');
  }
};

export default genDiff;

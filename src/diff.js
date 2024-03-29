import _ from 'lodash';
import path from 'path';
import getFormatter from './formatters/index.js';
import parseFile from './parsers/parse.js';

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
    if (obj[key] instanceof Object) {
      return {
        type: 'object',
        key,
        value: makeMetaTree(obj[key]),
      };
    }
    if (obj[key] instanceof Array) {
      return {
        type: 'array',
        key,
        value: makeMetaTree(obj[key]),
      };
    }
    return {
      type: 'primitive',
      key,
      value: obj[key],
    };
  });
  return result;
};

const getByKey = (tree, key) => tree.find((el) => el.key === key);
const diffElement = (type, { type: element, key, value }) => ({
  type, element, key, value,
});
const uniquesFromSecondTree = (t1, t2) => t2.filter((el) => !t1.find((el2) => el2.key === el.key));
// const sortPredicate = (a, b) => a.key.normalize().localeCompare(b.key.normalize());
const sortPredicate = (a) => a.key;

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
    { ...tree, value: _.sortBy(tree.value.flatMap((el) => compare(el, el)), [sortPredicate]) },
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
                value: _.sortBy(
                  subtree1.value
                    .flatMap((el) => compare(el, getByKey(subtree2.value, el.key)))
                    .concat(
                      uniquesFromSecondTree(subtree1.value, subtree2.value)
                        .flatMap((el) => compare(undefined, el)),
                    ),
                  [sortPredicate],
                ),
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
  return _.sortBy(result1.concat(result2), [sortPredicate]);
};

const genDiff = (filepath1, filepath2, format) => {
  const filepathFirst = path.resolve(process.cwd(), filepath1);
  const obj1 = parseFile(filepathFirst);
  const filepathSecond = path.resolve(process.cwd(), filepath2);
  const obj2 = parseFile(filepathSecond);
  if (obj1 === null || obj2 === null) {
    console.log('Only json and yaml format supported');
    process.exit(-1);
  }

  const diffs = diff(obj1, obj2);
  const formatter = getFormatter(format);
  return formatter(diffs);
};

export default genDiff;

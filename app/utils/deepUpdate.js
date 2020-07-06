// @flow
const isPlainObject = require('is-plain-object');

export default function update(value: any, fn: (key: any, value: any) => any) {
  if (Array.isArray(value)) {
    return updateArray(value, fn);
  }
  if (isPlainObject(value)) {
    return updateObject(value, fn);
  }

  return value;
}

function updateObject(obj, fn) {
  const newObj = {};
  // let key;
  let value;

  Object.keys(obj).forEach(key => {
    value = update(obj[key], fn);

    // if (fn.call(obj, value, key, obj)) {
    // console.log(
    //   'DU check',
    //   value !== obj[key],
    //   !isCollection(value),
    //   key,
    //   value,
    //   obj[key]
    // );
    if (!isCollection(value)) {
      // console.log('DU fn call');
      value = fn.call(obj, key, value);
    }

    newObj[key] = value;
    // }
  });

  return newObj;
}

function updateArray(arrayToFilter, fn) {
  const filtered = [];

  arrayToFilter.forEach((value: any, index: any, array: any) => {
    let newValue = update(value, fn);

    // if (fn.call(array, value, index, array)) {
    if (value !== array[index] && !isCollection(value)) {
      newValue = fn.call(index, value);
    }

    filtered.push(newValue);
    // }
  });

  return filtered;
}

function isCollection(value) {
  return Array.isArray(value) || isPlainObject(value);
}

import deepFilter from '../utils/deepFilter';

test('basic filter', () => {
  // const given1 = {
  //   val1: 'v1',
  //   val2: 'v2',
  //   nest: { val1: 'v1', val2: 'v2', val3: 'v3' },
  //   nest2: { val1: 'v1', val2: 'v2', val3: 'v3' },
  //   nest3: { val4: 'v4', val5: 'v5', val6: 'v6' },
  // };

  const given0 = {
    val1: 'v1',
    val2: 'v2',
    nest: { val1: 'v1', val2: 'v2', val3: 'v3' },
  };

  const want0 = {
    val1: 'v1',
    val2: 'v2',
    nest: { val1: 'v1', val2: 'v2' },
  };

  const strip0 = (_: void, prop: any) => {
    // prop is an array index or an object key
    // subject is either an array or an object
    // console.log(value, prop, subject);
    if (prop && prop.toString().includes('val3')) return false;
    return true;
  };

  expect(JSON.stringify(deepFilter(given0, strip0))).toBe(
    JSON.stringify(want0)
  );
});

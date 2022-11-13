import tplHelpers from 'template-helpers';

const helpers = tplHelpers();

helpers.lPad = (str: string, len: string | number, char: string | number) => {
  if (!str) return '';
  let length = 2;
  let filler = '0';

  if (typeof len === 'string') {
    length = parseInt(len, 10);
  } else {
    length = len;
  }

  if (typeof char === 'string' || typeof char === 'number') {
    filler = `${char}`;
  }

  return str.toString().padStart(length, filler);
};

export default helpers;

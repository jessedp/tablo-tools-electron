import * as fsPath from 'path';

export const normalize = (filepath: string) => {
  if (typeof window === 'undefined') return fsPath.normalize(filepath);
  return window.path.normalize(filepath);
};

export const sep = () => {
  if (typeof window === 'undefined') return fsPath.sep;
  return window.path.sep();
};

export const isAbsolute = (filepath: string) => {
  if (typeof window === 'undefined') return fsPath.isAbsolute(filepath);
  return window.path.isAbsolute(filepath);
};

export const join = (...args: string[]) => {
  if (typeof window === 'undefined') return fsPath.join(...args);
  return window.path.join(...args);
};

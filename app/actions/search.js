// @flow
export const SEARCH = 'SEARCH';

export function changeView(view: string) {
  return {
    type: SEARCH,
    view
  };
}

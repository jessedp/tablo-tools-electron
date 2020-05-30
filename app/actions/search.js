// @flow
export const SEARCH = 'SEARCH';
export const SEND_RESULTS = 'SEND_RESULTS';

export function changeView(view: string) {
  return {
    type: SEARCH,
    view
  };
}

export function sendResults(results: Object) {
  return {
    type: SEND_RESULTS,
    results
  };
}

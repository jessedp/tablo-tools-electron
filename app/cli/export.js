// @flow
import { hasInput, info } from './utils';

const runExport = async (args: any) => {
  const inputs = await hasInput(args);

  if (!inputs) {
    throw Error('No input source found');
  }

  console.log('exporting...');

  const exportIds = args.ids;

  if (args.savedSearch) {
    // need to search using SearchState
  }
  info(`Exporting ${exportIds.lenght} Recordings`);
};

export default runExport;

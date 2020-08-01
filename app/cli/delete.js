// @flow
import cliProgress from 'cli-progress';
import chalk from 'chalk';

import { hasInput, error } from './utils';
import type { SavedSearchType } from '../components/SavedSearch';
import buildSearchQuery from '../utils/search';
import { asyncForEach, throttleActions } from '../utils/utils';
import Airing from '../utils/Airing';

import build from './build';

const runDelete = async (args: any) => {
  const inputs = await hasInput(args);

  if (!inputs) {
    throw Error('No input source found');
  }

  await build(args.updateDb);

  let deleteIds = args.objectIds;

  if (args.savedSearch) {
    // need to search using SearchState
    const saved: SavedSearchType = await global.SearchDb.asyncFindOne({
      slug: args.savedSearch
    });

    const { query } = await buildSearchQuery(saved.state);

    const recs = await global.RecDb.asyncFind(query, { object_id: 1 });
    deleteIds = recs.map(rec => rec.object_id);
  }
  deleteIds.sort();

  if (global.VERBOSITY > 0) {
    console.log(
      `Deleting ${chalk.greenBright.bold(` ${deleteIds.length} `)} Recordings`
    );
  }

  const actions = [];
  await asyncForEach(deleteIds, async id => {
    const rec = await global.RecDb.asyncFindOne({ object_id: id });
    if (!rec) {
      error(`Unable to locate Recording "${id}" on this device. Skipping...`);
      return;
    }
    const airing = new Airing(rec);

    actions.push(() => airing.delete());
  });

  const atOnce = 4;
  const bar = new cliProgress.SingleBar(
    {
      format: `Deleting Recordings: ${chalk.hex('8C9440')(
        '{bar}'
      )} {percentage}% {value}/{total}`,
      clearOnComplete: false
    },
    cliProgress.Presets.shades_classic
  );
  bar.start(deleteIds.length, 0);

  await throttleActions(actions, atOnce, () => bar.increment());
  console.log();
};

export default runDelete;

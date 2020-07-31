import chalk from 'chalk';
import cliProgress from 'cli-progress';
import { Spinner } from 'cli-spinner';
import { differenceInMinutes } from 'date-fns';

import Airing from '../utils/Airing';
import { recDbCreated, setDbCreated } from '../utils/db';

export default async function build(updateArg: string = 'NAT') {
  if (updateArg === 'NO') return;

  if (updateArg === 'NAT') {
    const age = recDbCreated();
    const diff = differenceInMinutes(new Date(), Date.parse(age));
    // autoRebuildInterval??
    if (diff < 30) return;
  }

  const { Api } = global;

  // Should put a file based lock in so CLI and GUI aren't fighting each other
  if (global.VERBOSITY > 0) console.time(chalk.hex('8C9440')('Build Timer'));

  try {
    const total = await Api.getRecordingsCount(true);
    if (global.VERBOSITY > 1) console.log('total', total);

    let recs;
    if (global.VERBOSITY > 0) {
      const bar = new cliProgress.SingleBar(
        {
          format: `Fetch Recordings: ${chalk.hex('8C9440')(
            '{bar}'
          )} {percentage}% {value}/{total}`,
          clearOnComplete: false
        },
        cliProgress.Presets.shades_classic
      );
      bar.start(total, 0);
      recs = await Api.getRecordings(false, cnt => bar.update(cnt));
    } else {
      recs = await Api.getRecordings(false, () => {});
    }

    if (global.VERBOSITY > 1)
      console.log(`\nretrieved ${recs.length} recordings`);

    const spinner = new Spinner('Gathering Shows and finishing... %s');
    spinner.setSpinnerString('⢹⢺⢼⣸⣇⡧⡗⡏');

    if (global.VERBOSITY > 0) {
      console.log();
      spinner.start();
    }

    const { RecDb } = global;
    let cnt = 0;
    cnt = await RecDb.asyncRemove({}, { multi: true });
    await global.ShowDb.asyncRemove({}, { multi: true });
    await global.ChannelDb.asyncRemove({}, { multi: true });

    if (global.VERBOSITY > 1)
      spinner.setSpinnerTitle(`${cnt} old records removed`);
    cnt = await RecDb.asyncInsert(recs);
    if (global.VERBOSITY > 1)
      spinner.setSpinnerTitle(`${cnt.length} records added`);

    const showPaths = [];
    recs.forEach(rec => {
      const airing = new Airing(rec);

      try {
        if (airing.typePath) showPaths.push(airing.typePath);
      } catch (e) {
        console.error(
          'error pushing airing.typePath into showPaths - skipping'
        );
      }
    });

    /** init shows from recordings for now to "seed" the db */
    const shows = await Api.batch([...new Set(showPaths)]);

    cnt = await global.ShowDb.asyncInsert(shows);
    if (global.VERBOSITY > 1)
      spinner.setSpinnerTitle(`${cnt.length} SHOW records added`);

    /** Init all the channels b/c we have no choice. This also isn't much */
    const channelPaths = await Api.get('/guide/channels');

    const channels = await Api.batch([...new Set(channelPaths)]);

    cnt = await global.ChannelDb.asyncInsert(channels);
    if (global.VERBOSITY > 1)
      spinner.setSpinnerTitle(`${cnt.length} CHANNEL records added`);

    if (global.VERBOSITY > 0) {
      spinner.stop();
      console.log();
      console.timeEnd(chalk.hex('8C9440')('Build Timer'));
    }
    setDbCreated();
  } catch (e) {
    console.error(chalk.hex('CC6666').bold('Error Building Databases!'));
    throw e;
  }
}

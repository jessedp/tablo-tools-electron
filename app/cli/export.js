// @flow
import fs from 'fs';

import exitHook from 'exit-hook';

import cliProgress from 'cli-progress';
import chalk from 'chalk';

import { hasInput, error } from './utils';
import type { SavedSearchType } from '../components/SavedSearch';
import buildSearchQuery from '../utils/search';
import { asyncForEach, throttleActions, readableBytes } from '../utils/utils';
import Airing from '../utils/Airing';
import {
  DUPE_SKIP,
  EXP_CANCEL,
  EXP_DONE,
  EXP_SKIP,
  EXP_WORKING,
  EXP_FAIL
} from '../constants/app';
import build from './build';
import { ExportLogRecord } from '../utils/factories';
import getConfig from '../utils/config';

const runExport = async (args: any) => {
  const inputs = await hasInput(args);

  await build(args.updateDb);

  if (!inputs) {
    throw Error('No input source found');
  }

  let exportIds = args.objectIds;

  if (args.savedSearch) {
    // need to search using SearchState
    const saved: SavedSearchType = await global.SearchDb.asyncFindOne({
      slug: args.savedSearch
    });

    const { query } = await buildSearchQuery(saved.state);

    const recs = await global.RecDb.asyncFind(query, { object_id: 1 });
    exportIds = recs.map(rec => rec.object_id);
  }
  exportIds.sort();

  if (global.VERBOSITY > 0) {
    console.log(
      `Exporting ${chalk.greenBright.bold(` ${exportIds.length} `)} Recordings`
    );
  }

  const actions = [];
  await asyncForEach(exportIds, async id => {
    const rec = await global.RecDb.asyncFindOne({ object_id: id });
    if (!rec) {
      error(`Unable to locate Recording "${id}" on this device. Skipping...`);
      return;
    }

    const processVideo = async (airing: Airing) => {
      return new Promise((resolve, reject) => {
        const workingFile = airing.dedupedExportFile();

        const logRecord = ExportLogRecord(airing);
        logRecord.deleteOnFinish = getConfig().deleteOnFinish;

        logRecord.dupeAction = getConfig().actionOnDuplicate;

        const unsubscribe = exitHook(() => {});
        unsubscribe();

        exitHook(() => {
          logRecord.status = EXP_CANCEL;
          airing.cancelVideoProcess();
          reject(Error('Cleaning up...'));
        });

        if (global.VERBOSITY > 0) {
          console.log(
            '\n',
            chalk.blue(
              chalk.grey(`[${airing.id}]`),
              chalk.hex('8ABEB7')(`${airing.showTitle}`),
              ' - ',
              chalk.hex('5F819D')(` ${airing.title}`),
              `   ${airing.duration}   `,
              chalk.hex('81A2BE')(
                `${readableBytes(airing.videoDetails.size)}   `
              ),
              chalk.grey(
                `${airing.airingDetails.channel.channel.resolution.toUpperCase()}   `
              ),
              '\n',
              chalk.hex('DE935F')(airing.dedupedExportFile())
            )
          );
        }
        if (fs.existsSync(workingFile) && global.DUPE_ACTION === DUPE_SKIP) {
          if (global.VERBOSITY > 0) {
            console.log(
              chalk.hex('CC6666')('\nExists. Skipping due to policy.')
            );
          }
          return resolve();
        }

        if (global.VERBOSITY !== 1) {
          airing
            .processVideo(global.DUPE_ACTION, () => {})
            .then(val => resolve(val))
            .catch(err => {
              error(err.toString() + err.stack);
              reject(err);
            });
        } else {
          const bar = new cliProgress.SingleBar(
            {
              format: `${chalk.hex('8C9440')(
                '{bar}'
              )} {percentage}% ${chalk.hex('8C9440')(
                '|'
              )} {duration_formatted} ${chalk.hex('8C9440')(
                '|'
              )} {kbps}/kbps ${chalk.hex('8C9440')('|')} ETA: {eta_formatted}`,
              clearOnComplete: true
            },
            cliProgress.Presets.shades_classic
          );
          bar.start(100, 0, { kbps: 0 });

          let currentLog = [];

          const updateProgress = (_, progress: any) => {
            if (typeof progress !== 'object') return;
            currentLog = progress.log;
            if (progress.skipped) {
              console.log();
              bar.stop();
              logRecord.status = EXP_SKIP;
            } else if (progress.finished) {
              console.log();
              bar.stop();
              logRecord.status = EXP_DONE;
            } else if (progress.percent) {
              // console.log('prog', progress);
              const curr = progress.percent ? Math.round(progress.percent) : 0;
              const kbps = Math.round(progress.currentKbps);
              bar.update(curr, { kbps });
              logRecord.status = EXP_WORKING;
            }
          };

          airing
            .processVideo(global.DUPE_ACTION, updateProgress)
            .then(val => {
              logRecord.ffmpegLog = currentLog;
              logRecord.endTime = new Date().toLocaleString();
              global.ExportLogDb.asyncInsert(logRecord);

              return resolve(val);
            })
            .catch(err => {
              logRecord.status = EXP_FAIL;
              logRecord.ffmpegLog = currentLog;
              logRecord.endTime = new Date().toLocaleString();
              global.ExportLogDb.asyncInsert(logRecord);

              error(err.toString() + err.stack);
              reject(err);
            });
        }
      });
    };

    const curAiring = await Airing.create(rec);

    actions.push(() => {
      return processVideo(curAiring);
    });
  });

  const atOnce = 1;

  await throttleActions(actions, atOnce);
};

export default runExport;

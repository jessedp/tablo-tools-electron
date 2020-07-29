// @flow
import { app } from 'electron';
import yargs from 'yargs';
import chalk from 'chalk';
import {
  DUPE_ADDID,
  DUPE_OVERWRITE,
  DUPE_INC,
  DUPE_SKIP
} from '../constants/app';
import { setupApi } from '../utils/Tablo';
import { setupDb } from '../utils/db';

import runExport from './export';
import { loadTemplates } from '../utils/namingTpl';
import getConfig from '../utils/config';

const { version } = require('../../package.json');

const runCLIApp = async (): Promise<void> => {
  try {
    await setupApi();
    setupDb();
    await loadTemplates();

    const { device } = global.Api;
    if (!device || !device.private_ip) {
      throw Error('No devices available.');
    }
    // TODO: connectivity check?

    console.log(
      chalk.bgHex('282A2E')(
        chalk.hex('C5C8C6')('Current Device:'),
        chalk.hex('5E8D87')(
          ` ${device.name} - ${device.private_ip} - ${device.serverid}\n`
        )
      )
    );

    // how many cli args do we not care about?
    let slice = 4;
    if (app.isPackaged) {
      slice = 1;
    }

    const options = yargs(process.argv.slice(slice));
    options.version();
    options.usage = `
    Tablo Tools v${version}
    Usage: tablo-tools [options] [path ...]
  `;
    options
      .alias('h', 'help')
      .boolean('h')
      .describe('h', 'Print this usage message.');

    options
      .alias('s', 'saved-search')
      .string('s')
      .describe(
        's',
        'The slug for the Saved Search to be used to select records to operate on'
      );

    options
      .alias('i', 'ids')
      .array('i')
      .describe('i', 'A space-separated list of object_ids to operate on');

    options
      .alias('d', 'dupe-action')
      .choices('d', [DUPE_INC, DUPE_ADDID, DUPE_OVERWRITE, DUPE_SKIP])
      .describe(
        'd',
        `Exports Only. Action to take when duplicate file is encountered (default ${DUPE_INC}).`
      );

    // A ,  --all-devices do this on every device on the network
    // D , --devices list of device ids to do this on

    options
      .alias('u', 'updateDb')
      .describe(
        'u',
        'Whether to update DBs before running any command\ndefault "NAT" => only if db is older than 30 minutes\n'
      )
      .choices('u', ['YES', 'NO', 'NAT']);

    options
      .alias('p', 'progress')
      .describe('p', 'Display progress bar (default True).')
      .boolean('p');

    options
      .alias('v', 'verbose')
      .count('v')
      .describe(
        'v',
        'Turn on output logging - more vs, more info. Disables progress bars'
      );

    options
      .alias('q', 'quiet')
      .boolean('q')
      .describe('q', 'Be silent. Overrides verbosity/progress.');

    options.command(['export', 'export', 'e'], 'Export recordings', () => {
      // commands won't fire? manually use them later...
      // console.log('Export requested');
    });

    options.command(['delete', 'delete', 'd'], 'Delete recordings', () => {
      // commands won't fire? manually use them later...
      // console.log('deleting...');
    });

    options.epilogue(
      'for more information, visit https://jessedp.github.com/tablo-tools-electron'
    );

    const args = options.argv;
    global.VERBOSITY = args.verbose + 1;
    if (args.quiet) {
      global.VERBOSITY = 0;
    }

    if (args.dupeAction) {
      global.DUPE_ACTION = args.dupeAction;
    } else {
      global.DUPE_ACTION = getConfig().actionOnDuplicate;
    }

    if (args._.includes('export')) {
      await runExport(args);
      process.exit(0);
    } else if (args._.includes('delete')) {
      // await build(args.updateDb);
      console.log('deleting....');
    } else if (!args.help) {
      console.log(chalk.redBright('Unknown commands or options!'));

      options.version();
      options.showHelp();
    }
  } catch (e) {
    die(e);
  }
};
export default runCLIApp;

function die(message: any): void {
  console.log(chalk.redBright.bold('FATAL, EXITING...'));
  if (typeof message === 'object') {
    if (global.VERBOSITY > 1) {
      console.error(chalk.redBright(message.stack));
    } else {
      const msg = chalk.hex('A54242')(message.toString().replace('Error:', ''));
      console.error(msg);
    }
  } else {
    const msg = chalk.hex('A54242')(message.toString().replace('Error:', ''));
    console.error(msg);
  }
}

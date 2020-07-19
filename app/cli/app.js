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
import { info } from './utils';

const { version } = require('../../package.json');

const runCLIApp = async (): Promise<void> => {
  try {
    await setupApi();
    setupDb();

    const { device } = global.Api;
    if (!device || !device.private_ip) {
      throw Error('No devices available.');
    }
    // TODO: connectivity check...

    info(`Current Device: ${device.name} (${device.private_ip})`);

    // how many cli args do we not care about?
    let slice = 4;
    if (app.isPackaged) {
      slice = 2;
    }

    // const version = app.getVersion();
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
      .alias('p', 'progress')
      .describe('p', 'Display progress meter (default True).')
      .boolean('p');

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
      .describe('i', 'A list of object_ids for records to operate on');

    options
      .alias('d', 'duplicate-control')
      .choices('d', [DUPE_INC, DUPE_ADDID, DUPE_OVERWRITE, DUPE_SKIP])
      .describe(
        'd',
        `Exports Only. Action to take when duplicate file is encountered (default ${DUPE_INC}).`
      );

    // A ,  --all-devices do this on every device on the network
    // D , --devices list of device ids to do this on

    // --updateDB
    // force, natural [db age not older than last 1/2 hr, record count matches] (Default), no

    // options
    //   .alias('v', 'verbosity')
    //   .boolean('v')
    //   .describe('v', 'Logging level');
    options.command(['export', 'export', 'e'], 'Export recordings', () => {
      console.log('Export requested');
    });

    options.command(['delete', 'delete', 'd'], 'Delete recordings', () => {
      // const opts = options.argv;
      // console.log(options.argv);
      console.log('deleting...');
      process.exit(0);
    });

    options.epilogue(
      'for more information, find the documentation at https://jessedp.github.com/tablo-tools-electron'
    );

    const args = options.argv;
    // console.log('LAST RESORT', args);
    if (args._.includes('export')) {
      await runExport(args);
      process.exit(0);
    } else if (args._.includes('delete')) {
      console.log('deleting....');
    } else {
      console.log('Unknown commands or options!');

      console.log('argv', process.argv);
      console.log('argv slice', slice, process.argv.slice(slice));

      options.version();
      options.showHelp();

      die('');
    }
  } catch (e) {
    die(e);
  }
};
export default runCLIApp;

function die(message: any): void {
  // console.log(typeof message)
  console.log(chalk.redBright(message.toString()));
  app.exit(-1);
}

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
import { setupApi, setCurrentDevice } from '../utils/Tablo';
import { setupDb } from '../utils/db';

import { loadTemplates } from '../utils/namingTpl';
import getConfig from '../utils/config';
import { throttleActions } from '../utils/utils';
import runDelete from './delete';
import runExport from './export';

const { version } = require('../../package.json');

const runCLIApp = async (): Promise<void> => {
  try {
    await setupApi();
    setupDb();
    await loadTemplates();

    const { device } = global.Api;
    if (!device || !device.private_ip) {
      throw Error('No devices found.');
    }
    // TODO: connectivity check?

    // how many cli args do we not care about?
    let slice = 4;
    if (app.isPackaged) {
      slice = 1;
    }

    const options = yargs(process.argv.slice(slice));

    options
      .alias('s', 'saved-search')
      .string('s')
      .describe(
        's',
        'The slug for the Saved Search to be used to select records to operate on'
      );

    options
      .alias('i', 'object-ids')
      .array('i')
      .describe('i', 'A space-separated list of object_ids to operate on');

    options
      .alias('d', 'dupe-action')
      .choices('d', [DUPE_INC, DUPE_ADDID, DUPE_OVERWRITE, DUPE_SKIP])
      .describe(
        'd',
        `Exports Only. Action to take when duplicate file is encountered (default ${DUPE_INC}).`
      );

    options
      .alias('S', 'server-ids')
      .array('S')
      .describe(
        'S',
        'A space-separated list of Server Ids to operate on. Only necessary if more than 1 device exists. -A overrides this.'
      );

    options
      .alias('A', 'all-devices')
      .boolean('A')
      .describe('A', 'Try to operate on all found devices. Overrides -S');

    options
      .alias('u', 'updateDb')
      .describe(
        'u',
        'Whether to update DBs before running any command\ndefault "NAT" => only if db is older than 30 minutes\n'
      )
      .choices('u', ['YES', 'NO', 'NAT'])
      .coerce(['u'], (arg: string) => arg.toUpperCase());

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

    options
      .alias('h', 'help')
      .boolean('h')
      .describe('h', 'Print this help message.');

    options.version();

    options.epilogue(
      'for more information, visit https://jessedp.github.com/tablo-tools-electron'
    );

    // Device info
    const totalDevs = global.discoveredDevices.length;

    let curDevLine = chalk.bgHex('282A2E')(
      chalk.hex('C5C8C6')('Current Device:'),
      chalk.hex('5E8D87')(
        ` ${device.name} - ${device.private_ip} - ${device.serverid}\n`
      )
    );
    let deviceList = '';
    if (totalDevs > 1) {
      global.discoveredDevices.forEach(dev => {
        deviceList += chalk.hex('5E8D87')(
          `    ${dev.serverid} - ${dev.name} - ${dev.private_ip}\n`
        );
      });
    }

    // shows up before Help is displayed!
    options.usage(
      chalk.hex('4E9CDE')(
        chalk.hex('4E9CDE').bold(`Tablo Tools v${version}`),
        `\n────────────────────────────────────────────────────────────────────────────────\n`,
        'Usage: tablo-tools command [options]\n',
        curDevLine,
        totalDevs < 1
          ? ''
          : chalk.hex('FFF')(`${totalDevs} devices found:\n${deviceList}`)
      )
    );

    const args = options.argv;

    // If help is requested, we're done
    if (args.help) return;

    // arguments to "Settings"
    global.VERBOSITY = args.verbose + 1;
    if (args.quiet) {
      global.VERBOSITY = 0;
    }

    if (args.dupeAction) {
      global.DUPE_ACTION = args.dupeAction;
    } else {
      global.DUPE_ACTION = getConfig().actionOnDuplicate;
    }

    const hasCommand = ['export', 'delete'].some(el => args._.indexOf(el) >= 0);

    if (hasCommand) {
      if (totalDevs > 1 && !args.serverIds && !args.allDevices) {
        console.log(
          chalk.redBright.bold(`${totalDevs} devices found, but none selected!`)
        );
        console.log(chalk.hex('FFF')(deviceList));

        options.showHelp();
        return;
      }
      if (args.allDevices) {
        args.serverIds = global.discoveredDevices.map(dev => dev.serverid);
      }
      args.serverIds = args.serverIds ? args.serverIds : [device.serverid];

      // validate the Server Ids:
      args.serverIds.forEach(id => {
        if (!global.discoveredDevices.find(dev => dev.serverid === id)) {
          throw Error(`${id} is not a valid Server ID!`);
        }
      });

      // The Command logic
      const processCommand = async (serverId: string) => {
        return new Promise((resolve, reject) => {
          const curDevice = global.discoveredDevices.find(
            dev => dev.serverid === serverId
          );

          setCurrentDevice(curDevice, false);

          setupDb();

          curDevLine = chalk.bgHex('282A2E')(
            chalk.hex('C5C8C6')('Current Device:'),
            chalk.hex('5E8D87')(
              ` ${curDevice.name} - ${curDevice.private_ip} - ${curDevice.serverid}\n`
            )
          );

          if (global.VERBOSITY > 0) {
            console.log(curDevLine);
          }

          if (args._.includes('export')) {
            runExport(args)
              .then(res => {
                return resolve(res);
              })
              .catch(e => reject(e));
          } else if (args._.includes('delete')) {
            runDelete(args)
              .then(res => {
                return resolve(res);
              })
              .catch(e => reject(e));
          }
        });
      };

      // Build an Action for each device...
      const actions = [];
      args.serverIds.forEach(id => {
        actions.push(() => {
          return processCommand(id);
        });
      });

      // off we go!
      const atOnce = 1;
      await throttleActions(actions, atOnce);
    } else if (!args.help) {
      console.log(chalk.redBright.bold('Unknown commands or options!\n'));

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
      const msg = chalk.hex('FA3131')(message.toString().replace('Error:', ''));
      console.error(msg);
    }
  } else {
    const msg = chalk.hex('FA3131')(message.toString().replace('Error:', ''));
    console.error(msg);
  }
}

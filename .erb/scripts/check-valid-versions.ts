// Check to see if the places version numbers are set are in sync

import chalk from 'chalk';
import { exit } from 'process';
import { version as ReleaseVersion } from '../../release/app/package.json';
import { version as RootVersion } from '../../package.json';

if (ReleaseVersion !== RootVersion) {
  // throw new Error(chalk.whiteBright.bgRed.bold('App Versions are wrong!'));
  console.log(
    chalk.whiteBright.bgRed.bold('package.json Versions do not match!')
  );
  console.error(
    '\t',
    chalk.whiteBright.bgGrey.bold('Root Version    = '),
    chalk.blueBright.bold(RootVersion),
    'in',
    chalk.red.bold('./package.json')
  );
  console.error(
    '\t',
    chalk.whiteBright.bgGrey.bold('Release Version = '),
    chalk.blueBright.bold(ReleaseVersion),
    'in',
    chalk.red.bold('./release/app/package.json')
  );

  exit(-1);
}

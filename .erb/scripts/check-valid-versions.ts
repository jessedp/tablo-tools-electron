// Check to see if the places version numbers are set are in sync
import chalk from 'chalk';
import { execSync } from 'child_process';
import { exit } from 'process';
import { compare } from 'compare-versions';
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

execSync('git fetch --tags');

const getCurrentTagCmd = `git describe --tags --abbrev=0`;
const currentTag = execSync(getCurrentTagCmd)
  .toString()
  .replace('v', '')
  .trim();

console.log('currentTag', currentTag);
console.log('ReleaseVersion', ReleaseVersion);

if (!compare(ReleaseVersion, currentTag, '>')) {
  console.error(
    chalk.red.bold(
      `The Development/Current Release version (${ReleaseVersion}) must be greater than the Most Recently Tagged Release's version (${currentTag})`
    )
  );
  exit(-1);
}

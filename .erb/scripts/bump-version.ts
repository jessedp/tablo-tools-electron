import inquirer from 'inquirer';
import chalk from 'chalk';
import semver from 'semver';
import prettier, { Options } from 'prettier';

import { readFileSync, writeFileSync } from 'fs';

import { version as ReleaseVersion } from '../../release/app/package.json';

const releasePkgFile = './release/app/package.json';
const rootPkgFile = './package.json';

(async () => {
  console.log(
    '\t',
    chalk.whiteBright.bgRed.bold(`Current Version: ${ReleaseVersion}\n`)
  );

  const questions = [
    {
      type: 'input',
      name: 'newVersion',
      message: 'Enter New Version:',
      default: semver.inc(ReleaseVersion, 'prerelease', 'beta'),
    },
  ];
  let valid = false;
  let newVersion = '';
  do {
    /* eslint-disable no-await-in-loop */
    const answers = await inquirer.prompt(questions);

    newVersion = answers.newVersion.trim();
    valid =
      semver.valid(newVersion) === newVersion &&
      semver.gt(newVersion, ReleaseVersion);
    if (!valid) {
      console.log(
        '\t',
        chalk.whiteBright.bgRed.bold(
          `${newVersion} is not a valid version or increment!\n`
        )
      );
    }
  } while (!valid);

  const confirm = [
    {
      type: 'confirm',
      name: 'confirm',
      message: `Write new version ${newVersion} out to package.json files?`,
      default: false,
    },
  ];
  /* eslint-disable no-await-in-loop */
  const answers = await inquirer.prompt(confirm);
  if (answers.confirm === true) {
    const prettierOptions: Options = { filepath: rootPkgFile };
    const rootPkg: any = JSON.parse(readFileSync(rootPkgFile).toString());
    rootPkg.version = newVersion;
    writeFileSync(
      rootPkgFile,
      prettier.format(JSON.stringify(rootPkg, null, 2), prettierOptions)
    );

    const releasePkg: any = JSON.parse(readFileSync(releasePkgFile).toString());
    releasePkg.version = newVersion;
    writeFileSync(
      releasePkgFile,
      prettier.format(JSON.stringify(releasePkg, null, 2), prettierOptions)
    );
  }
})();

// @flow
import chalk from 'chalk';
import { getDefaultTemplateSlug } from '../utils/namingTpl';

export function info(msg: string) {
  console.log(chalk.blueBright(msg));
}

export function error(msg: string) {
  console.log(chalk.redBright(msg));
}

export async function hasInput(args: any) {
  if (args.savedSearch && args.ids) {
    throw Error(
      'Ambiguos input options - "saved-search" and "ids" parameters found'
    );
  }

  if (args.savedSearch) {
    const test =
      (await global.SearchDb.asyncFindOne({ slug: args.savedSearch })) ||
      getDefaultTemplateSlug() === args.savedSearch;

    if (!test) {
      throw Error(`Unknown Saved Search slug: ${args.savedSearch}`);
    }
    return true;
  }

  if (args.ids) {
    if (args.ids.length === 0) {
      throw Error('"ids" parameter used, but no ids given');
    }
    return true;
  }

  throw Error('No "saved-search" or "ids" parameter found');
}

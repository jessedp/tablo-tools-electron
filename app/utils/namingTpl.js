// @flow
import Airing from './Airing';
import getConfig from './config';
import deepFilter from './deepFilter';
import NamingTemplateType, {
  SERIES,
  PROGRAM,
  MOVIE,
  EVENT
} from '../constants/app';

/** BUILT-INS       */
export const defaultTemplates: Array<NamingTemplateType> = [
  {
    type: SERIES,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template:
      '{{episodePath}}/{{showTitle}}/Season {{lPad episode.season_number 2}}/{{showTitle}} - s{{lPad episode.season_number 2}}e{{lPad episode.number 2}}.{{EXT}}'
  },
  {
    type: MOVIE,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template: '{{moviePath}}/{{title}} - {{movie_airing.release_year}}.{{EXT}}'
  },
  {
    type: EVENT,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template: '{{eventPath}}/{{season}} - {{title}}.{{EXT}}'
  },
  {
    type: PROGRAM,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template: '{{programPath}}/{{title}}-{{airing_details.datetime}}.{{EXT}}'
  }
];

export function defaultTemplate(type: string): NamingTemplateType {
  return defaultTemplates.filter(rec => rec.type === type);
}

export function getTemplateSlug(type: string) {
  const {
    episodeTemplate,
    movieTemplate,
    eventTemplate,
    programTemplate
  } = getConfig();
  switch (type) {
    case SERIES:
      return episodeTemplate;
    case MOVIE:
      return movieTemplate;
    case EVENT:
      return eventTemplate;
    case PROGRAM:
    default:
      return programTemplate;
  }
}

/** USER RELATED       */

export async function getTemplate(
  type: string,
  slug?: string
): NamingTemplateType {
  const actualSlug = slug || getTemplateSlug(type);
  const templates = await getTemplates(type);

  const template = templates.filter(rec => rec.slug === actualSlug)[0];
  return template;
}

export async function getTemplates(type: string = '') {
  const defaults = defaultTemplate(type);
  let recs;
  if (type === '') {
    recs = await global.NamingDb.asyncFind({});
  } else {
    const typeRe = new RegExp(`${type}`);
    recs = await global.NamingDb.asyncFind({ path: { $regex: typeRe } });
  }

  return [...defaults, ...recs];
}

export async function buildTemplateVars(type: string) {
  const config = getConfig();
  const { episodePath, moviePath, eventPath, programPath } = config;

  const typeRe = new RegExp(type);
  const recData = await global.RecDb.asyncFindOne({ path: { $regex: typeRe } });
  const airing = await Airing.create(recData);

  const path = airing.typePath;
  const showRec = await global.ShowDb.asyncFindOne({ path });
  if (showRec) recData.show = showRec;

  const globalVars = {
    EXT: 'mp4',
    title: airing.title
  };

  let typeVars = {};
  switch (type) {
    case SERIES:
      typeVars = {
        episodePath,
        showTitle: airing.showTitle,
        seasonNum: airing.seasonNum,
        episodeNum: airing.episodeNum
      };
      break;

    case MOVIE:
      typeVars = {
        moviePath
      };
      break;
    case EVENT:
      typeVars = {
        eventPath
      };
      break;

    case PROGRAM:
    default:
      typeVars = { programPath };
  }

  // let result: Object = {};
  const result: Object = deepFilter(recData, (value: any, prop: any) => {
    // prop is an array index or an object key
    // subject is either an array or an object
    // console.log(value, prop, subject);
    if (prop && prop.toString().includes('path')) return false;
    if (prop && prop.toString().includes('error')) return false;
    if (prop && prop.toString().includes('warnings')) return false;
    if (prop && prop.toString().includes('_id')) return false;
    if (prop && prop.toString().includes('image')) return false;
    if (prop && prop.toString().includes('Image')) return false;
    if (prop && prop.toString().includes('user_info')) return false;
    if (prop && prop.toString().includes('qualifiers')) return false;

    return true;
  });

  return { ...globalVars, ...typeVars, ...result };
}

export function nope() {}

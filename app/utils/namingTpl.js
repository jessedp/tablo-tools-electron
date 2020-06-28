// @flow
import { format, parseISO } from 'date-fns';

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
    template:
      '{{programPath}}/{{title}}-{{strip "-" dateSort}}_{{strip "-" time24}}.{{EXT}}'
  }
];

export function defaultTemplate(type: string): NamingTemplateType {
  return defaultTemplates.filter(rec => rec.type === type);
}
export function getDefaultTemplateSlug() {
  return 'tablo-tools';
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

export function newTemplate(type: string): NamingTemplateType {
  const template = { label: '', slug: '', template: '' };

  switch (type) {
    case SERIES:
      template.template = '{{episodePath}}';
      break;
    case MOVIE:
      template.template = '{{moviePath}}';
      break;
    case EVENT:
      template.template = '{{eventPath}}';
      break;
    case PROGRAM:
    default:
      template.template = '{{programPath}}';
  }

  return template;
}

export async function upsertTemplate(template: NamingTemplateType) {
  if (!template.slug.trim()) return 'Cannot save empty slug!';
  if (template.slug === getDefaultTemplateSlug())
    return 'Cannot save default slug!';

  await global.NamingDb.asyncUpdate(
    { $and: [{ slug: template.slug }, { type: template.type }] },
    template,
    {
      upsert: true
    }
  );
  return '';
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
    const typeRe = new RegExp(type);
    recs = await global.NamingDb.asyncFind({ type: { $regex: typeRe } });
  }

  return [...defaults, ...recs];
}

export async function buildTemplateVars(type: string) {
  const config = getConfig();
  const { episodePath, moviePath, eventPath, programPath } = config;

  const typeRe = new RegExp(type);
  const recData = await global.RecDb.asyncFindOne({ path: { $regex: typeRe } });
  // const recData = await global.RecDb.asyncFindOne({ object_id: 839697 });

  const airing = await Airing.create(recData);

  const path = airing.typePath;
  const showRec = await global.ShowDb.asyncFindOne({ path });
  if (showRec) recData.show = showRec;

  const date = parseISO(recData.airing_details.datetime);

  const dateSort = format(date, 'yyyy-MM-dd');
  const dateNat = format(date, 'MM-dd-yyyy');

  const time12 = format(date, 'hh-mm-a');
  const time24 = format(date, 'HH-mm');

  const globalVars = {
    EXT: 'mp4',
    dateSort,
    dateNat,
    time12,
    time24,
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

    if (prop && prop.toString().includes('error')) return false;
    if (prop && prop.toString().includes('warnings')) return false;
    if (prop && prop.toString() === '_id') return false;
    if (prop && prop.toString().includes('image')) return false;
    if (prop && prop.toString().includes('Image')) return false;
    if (prop && prop.toString() === 'user_info') return false;
    if (prop && prop.toString() === 'qualifiers') return false;
    if (prop && prop.toString() === 'snapshot_image') return false;
    if (prop && prop.toString().includes('_offsets')) return false;
    if (prop && prop.toString().includes('seek')) return false;

    return true;
  });
  const shortcuts = { ...typeVars, ...globalVars };
  // const vars = { ...globalVars, ...typeVars, ...result };
  // const sanitizedVars = deepUpdate(vars, (key, val) => {
  //   if (typeof val === 'string') {
  //     console.log('sanitize?', key, val, sanitize(val));
  //     return sanitize(val);
  //   }
  //   console.log('not sanitized', key, val);
  //   return val;
  // });
  // console.log('DONE!');
  return [result, shortcuts];
}

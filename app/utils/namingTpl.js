// @flow
import * as fsPath from 'path';
import { format, parseISO } from 'date-fns';
import Handlebars from 'handlebars';

import getConfig from './config';
import deepFilter from './deepFilter';

import NamingTemplateType, {
  SERIES,
  PROGRAM,
  MOVIE,
  EVENT
} from '../constants/app';

const helpers = require('template-helpers')();
const sanitize = require('sanitize-filename');

Handlebars.registerHelper(helpers);

/** BUILT-INS       */
export const defaultTemplates: Array<NamingTemplateType> = [
  {
    type: SERIES,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template:
      '{{episodePath}}/{{showTitle}}/Season {{seasonNum}}/{{showTitle}} - {{episodeOrDate}}.{{EXT}}'
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

export function getDefaultTemplate(type: string): NamingTemplateType {
  return defaultTemplates.filter(rec => rec.type === type)[0];
}
export function getDefaultTemplateSlug() {
  return 'tablo-tools';
}
export function getDefaultRoot(type: string): string {
  const { episodePath, moviePath, eventPath, programPath } = getConfig();
  switch (type) {
    case SERIES:
      return episodePath;
    case MOVIE:
      return moviePath;
    case EVENT:
      return eventPath;
    case PROGRAM:
    default:
      return programPath;
  }
}

export function isCurrentTemplate(template: NamingTemplateType): boolean {
  return template.slug === getTemplateSlug(template.type);
}

export function isDefaultTemplate(template: NamingTemplateType): boolean {
  return template.slug === getDefaultTemplateSlug();
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
  const template = { type, label: '', slug: '', template: '' };

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

export async function upsertTemplate(modTemplate: NamingTemplateType) {
  const template = modTemplate;
  if (!template.type.trim()) return 'Cannot save without type!';
  if (!template.slug.trim()) return 'Cannot save empty slug!';
  if (template.slug === getDefaultTemplateSlug())
    return 'Cannot save default slug!';
  // eslint-disable-next-line no-underscore-dangle
  // delete template._id;

  // eslint-disable-next-line no-underscore-dangle
  await global.NamingDb.asyncUpdate({ _id: template._id }, template, {
    upsert: true
  });
  await loadTemplates();
  return '';
}

export async function deleteTemplate(template: NamingTemplateType) {
  await global.NamingDb.asyncRemove({
    $and: [{ type: template.type }, { slug: template.slug }]
  });
  await loadTemplates();
}

/** USER RELATED       */

export function getTemplate(type: string, slug?: string): NamingTemplateType {
  const actualSlug = slug || getTemplateSlug(type);
  const templates = getTemplates(type);

  const template = templates.filter(rec => rec.slug === actualSlug)[0];
  if (!template) {
    console.warn(`missing slug ${actualSlug}`);
    console.warn(type, getDefaultTemplateSlug(), templates);
    return getTemplate(type, getDefaultTemplateSlug());
  }
  return template;
}

export function getTemplates(type: string = '') {
  if (type === '') {
    return global.Templates;
  }

  return global.Templates.filter(tpl => tpl.type === type);
}

export async function loadTemplates() {
  const defaults = defaultTemplates;
  const recs = await global.NamingDb.asyncFind({});
  const all = [...defaults, ...recs];
  global.Templates = all;
}

/** Build & fill */
export function buildTemplateVars(airing: Object) {
  const config = getConfig();
  const { episodePath, moviePath, eventPath, programPath } = config;

  const recData = airing.data;

  if (!recData || !recData.airing_details || !recData.airing_details.datetime) {
    console.warn('buildTemplateVars MISSING airing_details', recData);
    return {};
  }

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
    title: airing.title,
    stripTitle: stripSecondary(airing.title)
  };

  let typeVars = {};
  switch (airing.type) {
    case SERIES:
      typeVars = {
        episodePath,
        showTitle: airing.showTitle,
        stripShowTitle: stripSecondary(airing.showTitle),
        seasonNum: airing.seasonNum,
        episodeNum: airing.episodeNum,
        episodeOrDate: airing.episodeNum,
        episodeOrTMS: airing.episodeNum
      };

      if (airing.episode.season_number === 0) {
        typeVars.episodeOrDate = dateSort;
        typeVars.episodeOrTMS = airing.episode.tms_id;
      }

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

  return [result, shortcuts];
}

export function fillTemplate(
  template: NamingTemplateType | string,
  templateVars: Object
) {
  let tplStr = template;
  if (typeof template === 'object') {
    tplStr = template.template;
  }

  // original checking each part of path individually - most leeway
  const parts = tplStr.split(fsPath.sep).map(part => {
    const hbTemplate = Handlebars.compile(part, {
      noEscape: true,
      preventIndent: true
    });
    if (templateVars) {
      try {
        const tpl = hbTemplate({ ...templateVars[0], ...templateVars[1] });
        return tpl;
      } catch (e) {
        console.warn('Handlebars unable to parse', e);
      }
    }
    return part;
  });
  let filledPath = fsPath.normalize(parts.join(fsPath.sep));

  // just check the whole string - will be necessary for regex, not as resilient as path splitting
  // const hbTemplate = Handlebars.compile(tplStr, {
  //   noEscape: true,
  //   preventIndent: true
  // });
  // let tpl = tplStr;
  // if (templateVars) {
  //   try {
  //     tpl = hbTemplate({ ...templateVars[0], ...templateVars[1] });
  //     // return tpl;
  //   } catch (e) {
  //     console.warn('Handlebars unable to parse', e);
  //   }
  // }

  // let filledPath = fsPath.normalize(tpl);

  let i = 0;

  const sanitizeParts = filledPath.split(fsPath.sep).map(part => {
    i += 1;
    if (i === 1) {
      const test = part + fsPath.sep;
      if (fsPath.isAbsolute(test)) return part;

      return `${getConfig().programPath}${part}`;
    }

    const newPart = sanitize(part);

    // newPart = stripSecondary(newPart);
    return newPart;
  });
  filledPath = fsPath.normalize(sanitizeParts.join(fsPath.sep));

  if (!filledPath.endsWith('.mp4')) filledPath += '.mp4';
  return filledPath;
}

const stripSecondary = (piece: string) => {
  const secondaryReplacements = [`'`, `’`, ',', ':', '!', '[', '&', ';'];

  let newPiece = piece;
  secondaryReplacements.forEach(rep => {
    newPiece = newPiece.replace(rep, ''); // $& means the whole matched string
  });
  return newPiece;
};

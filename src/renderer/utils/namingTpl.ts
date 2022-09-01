import * as fsPath from 'path';
import { format, parseISO } from 'date-fns';
import Handlebars from 'handlebars';

// import getConfig from './config';
import sanitize from 'sanitize-filename';
import getConfig from './config';
import deepFilter from './deepFilter';
import {
  NamingTemplateType,
  SERIES,
  PROGRAM,
  MOVIE,
  EVENT,
} from '../constants/app';

const debug = require('debug')('tt:namingTpl');
// import sanitize from 'sanitize-filename';

/** BUILT-INS       */
export const defaultTemplates: Array<NamingTemplateType> = [
  {
    type: SERIES,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template:
      '{{episodePath}}/{{showTitle}}/Season {{seasonNum}}/{{showTitle}} - {{episodeOrDate}}.{{EXT}}',
  },
  {
    type: MOVIE,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template: '{{moviePath}}/{{title}} - {{movie_airing.release_year}}.{{EXT}}',
  },
  {
    type: EVENT,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template: '{{eventPath}}/{{season}} - {{title}}.{{EXT}}',
  },
  {
    type: PROGRAM,
    label: 'Tablo Tools',
    slug: 'tablo-tools',
    template:
      '{{programPath}}/{{title}}-{{strip "-" dateSort}}_{{strip "-" time24}}.{{EXT}}',
  },
];
export function getDefaultTemplate(type: string): NamingTemplateType {
  return defaultTemplates.filter((rec) => rec.type === type)[0];
}
export function getDefaultTemplateSlug() {
  return 'tablo-tools';
}
export function getDefaultRoot(type: string): string {
  // const { episodePath, moviePath, eventPath, programPath } = getConfig();
  const { episodePath, moviePath, eventPath, programPath } =
    window.ipcRenderer.sendSync('get-config');

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
  const { episodeTemplate, movieTemplate, eventTemplate, programTemplate } =
    getConfig();

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
  const template = {
    type,
    label: '',
    slug: '',
    template: '',
  };

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

  await global.NamingDb.asyncUpdate(
    {
      // eslint-disable-next-line no-underscore-dangle
      _id: template._id,
    },
    template,
    {
      upsert: true,
    }
  );
  await loadTemplates();
  return '';
}
export async function deleteTemplate(template: NamingTemplateType) {
  await window.db.asyncRemove('NamingDb', {
    $and: [
      {
        type: template.type,
      },
      {
        slug: template.slug,
      },
    ],
  });
  await loadTemplates();
}

/** USER SPECIFIC/RELATED (non system/builtin) */
export function getTemplates(type = '') {
  // console.log(
  //   'renderer - globalThis.LoadedTemplates',
  //   globalThis.LoadedTemplates
  // );
  if (type === '') {
    return globalThis.LoadedTemplates;
  }

  return globalThis.LoadedTemplates.filter(
    (tpl: NamingTemplateType) => tpl.type === type
  );
}

export function getTemplate(type: string, slug?: string): NamingTemplateType {
  const actualSlug = slug || getTemplateSlug(type);
  const templates = getTemplates(type);
  const template: NamingTemplateType = templates.filter(
    (rec: NamingTemplateType) => rec.slug === actualSlug
  )[0];

  if (!template) {
    console.warn(`missing slug ${actualSlug}`);
    console.warn(type, getDefaultTemplateSlug(), templates);
    return getTemplate(type, getDefaultTemplateSlug());
  }

  return template;
}
export async function loadTemplates() {
  const defaults = defaultTemplates;

  const recs = await window.Templates.load();
  console.log('renderer - loaded templates: ', recs);
  const all = [...defaults, ...recs];
  console.log('renderer - all: ', all);
  globalThis.LoadedTemplates = all;
  debug('renderer - loadeded templates');
}

/** Build & fill */
export type TemplateVarsType = {
  full: Record<string, any>;
  shortcuts: Record<string, any>;
};

export function buildTemplateVars(
  airing: Record<string, any>
): TemplateVarsType {
  let config: ConfigType;
  if (typeof window === 'undefined') {
    config = getConfig();
  } else {
    config = window.ipcRenderer.sendSync('get-config');
  }

  const { episodePath, moviePath, eventPath, programPath } = config;

  const recData = airing.data;

  if (!recData || !recData.airing_details || !recData.airing_details.datetime) {
    console.warn('buildTemplateVars MISSING airing_details', recData);
    return { full: {}, shortcuts: {} };
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
    stripTitle: stripSecondary(airing.title),
  };
  let typeVars; // = {};

  switch (airing.type) {
    case SERIES:
      typeVars = {
        episodePath,
        showTitle: airing.showTitle,
        stripShowTitle: stripSecondary(airing.showTitle),
        seasonNum: airing.seasonNum,
        episodeNum: airing.episodeNum,
        episodeOrDate: airing.episodeNum,
        episodeOrTMS: airing.episodeNum,
      };

      if (airing.episode.season_number === 0) {
        typeVars.episodeOrDate = dateSort;
        typeVars.episodeOrTMS = airing.episode.tms_id;
      }

      break;

    case MOVIE:
      typeVars = {
        moviePath,
      };
      break;

    case EVENT:
      typeVars = {
        eventPath,
      };
      break;

    case PROGRAM:
    default:
      typeVars = {
        programPath,
      };
  }

  // let result: Object = {};
  const result: Record<string, any> = deepFilter(recData, (_, prop: any) => {
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
  return { full: result, shortcuts };
}
export function fillTemplate(
  template: NamingTemplateType | string,
  templateVars: TemplateVarsType
) {
  let tplStr = '';

  if ((template as NamingTemplateType).type) {
    tplStr = (template as NamingTemplateType).template;
  } else {
    tplStr = template as string;
  }

  const parts = tplStr.split(fsPath.sep).map((part: string) => {
    const hbTemplate = Handlebars.compile(part, {
      noEscape: true,
      preventIndent: true,
    });

    if (templateVars) {
      try {
        const tpl = hbTemplate({
          ...templateVars.full,
          ...templateVars.shortcuts,
        });
        return tpl;
      } catch (e) {
        console.warn('Handlebars unable to parse', e);
      }
    }

    return part;
  });
  let filledPath = fsPath.normalize(parts.join(fsPath.sep));
  let i = 0;

  const sanitizeParts = filledPath.split(fsPath.sep).map((part) => {
    i += 1;

    if (i === 1) {
      const test = part + fsPath.sep;
      if (fsPath.isAbsolute(test)) return part;
      return `${window.ipcRenderer.sendSync('get-config').programPath}${part}`;
    }

    const newPart = sanitize(part);

    return newPart;
  });
  filledPath = fsPath.normalize(sanitizeParts.join(fsPath.sep));
  if (!filledPath.endsWith('.mp4')) filledPath += '.mp4';
  return filledPath;
}

const stripSecondary = (piece: string) => {
  const secondaryReplacements = [`'`, `’`, ',', ':', '!', '[', '&', ';'];
  let newPiece = piece;
  secondaryReplacements.forEach((rep) => {
    newPiece = newPiece.replace(rep, ''); // $& means the whole matched string
  });
  return newPiece;
};
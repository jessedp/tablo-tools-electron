import Airing from './Airing';
import getConfig from './config';
import deepFilter from './deepFilter';
import { SERIES, PROGRAM, MOVIE, EVENT } from '../constants/app';

export async function buildTemplateVars(type: number) {
  const config = getConfig();
  const { episodePath, moviePath, eventPath, programPath } = config;

  const typeRe = new RegExp(`${type}`);
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

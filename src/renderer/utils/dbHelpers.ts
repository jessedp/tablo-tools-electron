import Airing from './Airing';
import Show from './Show';
import { asyncForEach } from './utils';

export async function movieList() {
  const recType = /movie/;
  const recs = await window.db.findAsync('RecDb', {
    path: {
      $regex: recType,
    },
  });
  const objRecs: Airing[] = [];
  await asyncForEach(recs, async (rec) => {
    const airing = await Airing.create(rec);
    objRecs.push(airing);
  });

  const titleSort = (a: Airing, b: Airing) => {
    if (a.show.sortableTitle > b.show.sortableTitle) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));
  return objRecs;
}

export async function showList() {
  const recType = /series/;
  const recs = await window.db.findAsync('ShowDb', {
    path: {
      $regex: recType,
    },
  });

  const objRecs: Show[] = [];
  await asyncForEach(recs, async (rec) => {
    const show = new Show(rec);
    objRecs.push(show);
  });

  const titleSort = (a: Show, b: Show) => {
    if (a.sortableTitle > b.sortableTitle) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));
  return objRecs;
}

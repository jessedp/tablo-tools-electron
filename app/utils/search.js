// @flow
import type { SearchState } from '../components/SearchForm';
import { escapeRegExp } from './utils';
import Show from './Show';
import { showList } from '../components/Shows';

export default async function buildSearchQuery(
  state: SearchState,
  showsList?: Array<Show>
) {
  const {
    searchValue,
    stateFilter,
    typeFilter,
    watchedFilter,
    comskipFilter,
    cleanFilter,
    showFilter,
    seasonFilter
  } = state;

  let locShowsList = showsList;

  if (!locShowsList) locShowsList = await showList();

  const query = {};
  const steps = [];

  if (searchValue.trim()) {
    // query['airing_details.show_title'] =  { $regex: re };
    const re = new RegExp(escapeRegExp(searchValue), 'i');
    query.$or = [
      { 'airing_details.show_title': { $regex: re } },
      { 'episode.title': { $regex: re } },
      { 'episode.description': { $regex: re } },
      { 'event.title': { $regex: re } },
      { 'event.description': { $regex: re } }
    ];

    steps.push({
      type: 'search',
      value: searchValue,
      text: `title or description contains "${searchValue}"`
    });
  }

  if (typeFilter !== 'any') {
    const typeRe = new RegExp(typeFilter, 'i');
    query.path = { $regex: typeRe };

    steps.push({
      type: 'type',
      value: typeFilter,
      text: `is: ${typeFilter}`
    });
  }

  if (stateFilter !== 'any') {
    query['video_details.state'] = stateFilter;

    steps.push({
      type: 'state',
      value: stateFilter,
      text: `${stateFilter}`
    });
  }

  if (cleanFilter !== 'any') {
    query['video_details.clean'] = cleanFilter !== 'dirty';

    steps.push({
      type: 'clean',
      value: cleanFilter,
      text: `is ${cleanFilter}`
    });
  }

  if (watchedFilter !== 'all') {
    query['user_info.watched'] = watchedFilter === 'yes';
    steps.push({
      type: 'watched',
      value: stateFilter,
      text: `${watchedFilter === 'yes' ? 'watched' : 'not watched'}`
    });
  }

  if (comskipFilter !== 'all') {
    let text = 'comskip is not ready';
    if (comskipFilter === 'ready') {
      query['video_details.comskip.state'] = 'ready';
      text = 'comskip is ready';
    } else if (comskipFilter === 'failed') {
      query['video_details.comskip.state'] = { $ne: 'ready' };
    } else {
      query['video_details.comskip.error'] = comskipFilter;
      text = `comskip failed b/c ${comskipFilter}`;
    }
    steps.push({
      type: 'comskip',
      value: stateFilter,
      text
    });
  }

  if (showFilter !== '' && showFilter !== 'all') {
    let show = locShowsList.find(item => item.path === showFilter);
    if (!show) show = { title: 'Unknown' };
    query.series_path = showFilter;

    steps.push({
      type: 'show',
      value: showFilter,
      text: `show is ${show.title}`
    });

    if (seasonFilter !== '' && seasonFilter !== 'all') {
      // / seasonList
      query['episode.season_number'] = parseInt(seasonFilter, 10);
      steps.push({
        type: 'season',
        value: seasonFilter,
        text: `season #${seasonFilter}`
      });
    }
  }

  return { query, steps };
}

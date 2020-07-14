// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import PubSub from 'pubsub-js';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

import ReactPaginate from 'react-paginate';
import Select, { components } from 'react-select';

import {
  asyncForEach,
  escapeRegExp,
  readableBytes,
  readableDuration,
  throttleActions
} from '../utils/utils';
import Airing, { ensureAiringArray } from '../utils/Airing';
import Show from '../utils/Show';
import { showList } from './Shows';
import TabloImage from './TabloImage';
import type { SearchAlert } from '../utils/types';
import { comskipAvailable } from '../utils/Tablo';
import SavedSearch from './SavedSearch';
import SelectStyles from './SelectStyles';
import SavedSearchEdit from './SavedSearchEdit';
import * as SearchActions from '../actions/search';
import SearchResults from './SearchResults';
import { EMPTY_SEARCHALERT } from '../constants/app';
import MatchesToBadges from './SearchFilterMatches';

type Props = {
  sendResults: Object => void
};

type Season = {
  num: number,
  count: number
};

export type SearchState = {
  emptySearch: boolean,
  skip: number,
  limit: number,
  searchValue: string,
  typeFilter: string,
  stateFilter: string,
  watchedFilter: string,
  showFilter: string,
  seasonFilter: string,
  comskipFilter: string,
  cleanFilter: string,
  savedSearchFilter: string,
  sortFilter: number,
  percent: number,
  percentLocation: number,
  recordCount: number,
  searchAlert: SearchAlert,
  airingList: Array<Airing>,
  actionList: Array<Airing>,
  seasonList: Array<Season>
};

const SORT_REC_ASC = 1;
const SORT_REC_DSC = 2;
const SORT_SIZE_ASC = 3;
const SORT_SIZE_DSC = 4;
const SORT_DURATION_ASC = 5;
const SORT_DURATION_DSC = 6;

class SearchForm extends Component<Props, SearchState> {
  props: Props;

  initialState: SearchState;

  showsList: Array<Show>;

  savedSearchList: Array<Object>; // TODO: savedSearchList type

  psToken: null;

  constructor() {
    super();

    this.initialState = {
      emptySearch: true,
      skip: 0,
      limit: 50,
      searchValue: '',
      typeFilter: 'any',
      stateFilter: 'any',
      watchedFilter: 'all',
      comskipFilter: 'all',
      cleanFilter: 'any',
      showFilter: '',
      savedSearchFilter: '',
      seasonFilter: '',
      sortFilter: SORT_REC_DSC,
      percent: 100,
      percentLocation: 0,
      recordCount: 0,
      searchAlert: EMPTY_SEARCHALERT,
      airingList: [],
      actionList: [],
      seasonList: []
    };

    const storedState = JSON.parse(localStorage.getItem('SearchState') || '{}');

    // v0.1.11 - broken when added in v0.1.10
    if (Number.isNaN(parseInt(storedState.limit, 10)))
      storedState.limit = this.initialState.limit;

    // added v0.10...
    if (storedState.alert && typeof storedState.alert.matches === 'string')
      storedState.alert.matches = [];
    if (
      storedState.searchAlert &&
      typeof storedState.searchAlert.matches === 'string'
    )
      storedState.searchAlert.matches = [];

    const initialStateCopy = { ...this.initialState };
    // TODO: fix react-paginate to take initial page
    storedState.skip = 0;
    this.state = Object.assign(initialStateCopy, storedState);
    this.showsList = [];
    this.savedSearchList = [];

    this.search = this.search.bind(this);
    this.resetSearch = this.resetSearch.bind(this);

    this.stateChange = this.stateChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.watchedChange = this.watchedChange.bind(this);
    this.showChange = this.showChange.bind(this);
    this.seasonChange = this.seasonChange.bind(this);
    this.comskipChange = this.comskipChange.bind(this);
    this.cleanChange = this.cleanChange.bind(this);
    this.savedSearchChange = this.savedSearchChange.bind(this);
    this.savedSearchUpdate = this.savedSearchUpdate.bind(this);
    this.showSelected = this.showSelected.bind(this);
    this.searchChange = this.searchChange.bind(this);
    this.searchKeyPressed = this.searchKeyPressed.bind(this);

    this.percentDrag = this.percentDrag.bind(this);

    (this: any).sortChange = this.sortChange.bind(this);

    (this: any).handlePageClick = this.handlePageClick.bind(this);
    (this: any).updatePerPage = this.updatePerPage.bind(this);
    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    // v0.1.12 - make sure we have Airings
    let { actionList } = this.state;
    actionList = await ensureAiringArray(actionList);
    this.savedSearchList = await global.SearchDb.asyncFind({});

    await this.setState({ actionList });
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    const cleanState = { ...this.state };
    PubSub.unsubscribe(this.psToken);
    localStorage.setItem('SearchState', JSON.stringify(cleanState));
  }

  percentDragTimeout: ?TimeoutID = null;

  percentDragSearchTimeout: ?TimeoutID = null;

  setStateStore(...args: Array<Object>) {
    const values = args[0];
    // console.log(values);
    this.setState(values);
    const cleanState = this.state;

    localStorage.setItem('SearchState', JSON.stringify(cleanState));
  }

  async handlePageClick(data: { selected: number }) {
    const { limit } = this.state;
    // this.setState( {skip: 0 });
    const { selected } = data;
    const offset = Math.ceil(selected * limit);

    this.setState({ skip: offset }, () => {
      this.search();
    });
  }

  updatePerPage = async (event: Option) => {
    await this.setState({ limit: parseInt(event.value, 10) });
    this.search();
  };

  async refresh() {
    this.showsList = await showList();
    this.savedSearchList = await global.SearchDb.asyncFind({});

    this.search();
  }

  showSelected = async () => {
    const { sendResults } = this.props;
    const { actionList } = this.state;
    let { searchAlert } = this.state;
    console.log('showSelected');

    const len = actionList.length;
    if (len === 0) return;

    await sendResults({
      loading: true,
      airingList: [],
      searchAlert: this.initialState.searchAlert
    });

    const timeSort = (a, b) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    const stats = [];
    actionList.sort((a, b) => timeSort(a, b));

    const size = readableBytes(
      actionList.reduce((a, b) => a + (b.videoDetails.size || 0), 0)
    );
    stats.push({ text: size });
    const duration = readableDuration(
      actionList.reduce((a, b) => a + (b.videoDetails.duration || 0), 0)
    );
    stats.push({ text: duration });

    searchAlert = {
      type: 'light',
      text: `${len} selected recordings`,
      matches: [],
      stats
    };

    this.setState({ searchAlert });

    sendResults({
      loading: false,
      airingList: actionList,
      searchAlert,
      actionList
    });

    const cleanState = { ...this.state };
    localStorage.setItem('SearchState', JSON.stringify(cleanState));
  };

  deleteAll = async (countCallback: Function) => {
    let { actionList } = this.state;
    actionList = ensureAiringArray(actionList);
    const list = [];
    actionList.forEach(item => {
      list.push(() => item.delete());
    });

    await throttleActions(list, 4, countCallback)
      .then(async () => {
        // let ConfirmDelete display success for 1 sec
        setTimeout(() => {
          this.search();
        }, 1000);
        return false;
      })
      .catch(result => {
        console.log('deleteAll failed', result);
        return false;
      });
  };

  resetSearch = async () => {
    const { actionList, sortFilter, limit } = this.state;
    const newState = { ...this.initialState };
    newState.actionList = actionList;
    newState.sortFilter = sortFilter;
    newState.limit = limit;
    await this.setStateStore(newState);
    this.refresh();
  };

  stateChange = async (event: Option) => {
    await this.setState({ stateFilter: event.value });
    this.search();
  };

  typeChange = async (event: Option) => {
    await this.setState({ typeFilter: event.value });
    this.search();
  };

  watchedChange = async (event: Option) => {
    await this.setState({ watchedFilter: event.value });
    this.search();
  };

  comskipChange = async (event: Option) => {
    await this.setState({ comskipFilter: event.value });
    this.search();
  };

  sortChange = async (event: Option) => {
    await this.setState({ sortFilter: parseInt(event.value, 10) });
    this.search();
  };

  cleanChange = async (event: Option) => {
    await this.setState({ cleanFilter: event.value });
    this.search();
  };

  showChange = async (event: Option) => {
    await this.setState({ showFilter: event.value });
    const list = [];
    if (event.value !== '' && event.value !== 'all') {
      // load seasons for show
      const query = { series_path: event.value };
      const seasons = {};

      const recs = await global.RecDb.asyncFind(query);
      await asyncForEach(recs, async rec => {
        const airing = await Airing.create(rec);
        const num = airing.episode.season_number;
        if (seasons[num]) seasons[num] += 1;
        else seasons[num] = 1;
      });
      Object.keys(seasons).forEach(key => {
        list.push({ num: parseInt(key, 10), count: seasons[key] });
      });
    }

    await this.setState({ seasonList: list });
    this.search();
  };

  seasonChange = async (event: Option) => {
    await this.setState({ seasonFilter: event.value });
    this.search();
  };

  updateSavedSearch = async (searchId: string = '') => {
    const { savedSearchFilter } = this.state;

    this.savedSearchList = await global.SearchDb.asyncFind({});

    if (!searchId) {
      await this.resetSearch();
    }

    const rec = await global.SearchDb.asyncFindOne({ _id: searchId });
    if (!rec) {
      console.log(searchId, rec);
      console.warn('Unable to find Saved Seach', searchId);
      return;
    }

    if (searchId !== savedSearchFilter) {
      rec.state.savedSearchFilter = searchId;

      const initialStateCopy = { ...this.initialState };
      const newState = Object.assign(initialStateCopy, rec.state);
      await this.setState(newState);
      await this.search();
    } else {
      await this.resetSearch();
    }
  };

  savedSearchChange = async (event: Option) => {
    this.updateSavedSearch(event.value);
  };

  savedSearchUpdate = async (searchId: string) => {
    this.updateSavedSearch(searchId);
  };

  searchChange = (event: SyntheticEvent<HTMLInputElement>) => {
    if (!event.currentTarget.value && event.currentTarget.value !== '') return;
    this.setState({ searchValue: event.currentTarget.value });
  };

  searchKeyPressed = async (
    event: SyntheticKeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      await this.search();
    }
  };

  percentDrag = (event: SyntheticDragEvent<HTMLInputElement>) => {
    if (!event) return;

    this.setStateStore({ percent: event.currentTarget.value });

    const slider = event.currentTarget;

    if (this.percentDragSearchTimeout) {
      clearTimeout(this.percentDragSearchTimeout);
    }

    if (this.percentDragTimeout) {
      clearTimeout(this.percentDragTimeout);
    }
    const sliderPos = parseInt(slider.value, 10) / parseInt(slider.max, 10);

    // blah, figure out the math of this :/
    let xShim = 0;
    if (sliderPos < 0.25) {
      xShim = 7;
    } else if (sliderPos < 0.5) {
      xShim = 2;
    } else if (sliderPos < 0.66) {
      xShim = 0;
    } else if (sliderPos < 0.85) {
      xShim = -2;
    } else {
      xShim = -4;
    }

    const xPos = Math.round(slider.clientWidth * sliderPos) + xShim;

    this.percentDragTimeout = setTimeout(async () => {
      if (xPos) await this.setStateStore({ percentLoc: xPos });
    }, 10);

    this.percentDragSearchTimeout = setTimeout(async () => {
      this.search();
    }, 1000);
  };

  search = async () => {
    const { sendResults } = this.props;

    const {
      skip,
      limit,
      percent,
      searchValue,
      stateFilter,
      typeFilter,
      watchedFilter,
      comskipFilter,
      cleanFilter,
      showFilter,
      seasonFilter,
      sortFilter
    } = this.state;

    const query = {};
    const steps = [];

    if (searchValue.trim()) {
      const re = new RegExp(escapeRegExp(searchValue), 'i');
      // query['airing_details.show_title'] =  { $regex: re };
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
      let show = this.showsList.find(item => item.path === showFilter);
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

    const emptySearch = Object.keys(query).length === 0;

    const count = await global.RecDb.asyncCount(query);
    const projection = [];

    switch (sortFilter) {
      case SORT_DURATION_ASC:
        projection.push(['sort', { 'video_details.duration': 1 }]);
        break;
      case SORT_DURATION_DSC:
        projection.push(['sort', { 'video_details.duration': -1 }]);
        break;
      case SORT_SIZE_ASC:
        projection.push(['sort', { 'video_details.size': 1 }]);
        break;
      case SORT_SIZE_DSC:
        projection.push(['sort', { 'video_details.size': -1 }]);
        break;
      case SORT_REC_ASC:
        projection.push(['sort', { 'airing_details.datetime': 1 }]);
        break;
      case SORT_REC_DSC:
      default:
        projection.push(['sort', { 'airing_details.datetime': -1 }]);
    }
    let newLimit = parseInt(limit, 10);
    newLimit = Number.isNaN(limit) ? this.initialState.limit : limit;
    if (newLimit !== -1) {
      projection.push(['skip', skip]);
      projection.push(['limit', limit]);
    }

    let recs = await global.RecDb.asyncFind(query, projection);

    if (percent < 100) {
      const pct = percent / 100;
      recs = recs.filter(
        rec => rec.airing_details.duration * pct >= rec.video_details.duration
      );
      steps.push({
        type: 'complete',
        value: percent,
        text: `${percent}% or less complete`
      });
    }

    const airingList = [];
    let description;

    let updateState;
    let alert: SearchAlert;
    if (!recs || recs.length === 0) {
      description = `No records found`;
      alert = { type: 'warning', text: description, matches: steps };
      updateState = {
        searchAlert: alert,
        airingList,
        recordCount: 0
      };
    } else {
      sendResults({
        loading: true,
        searchAlert: this.initialState.searchAlert
      });

      await asyncForEach(recs, async doc => {
        try {
          const airing = await Airing.create(doc);
          airingList.push(airing);
        } catch (e) {
          console.log('Unable to load Airing data: ', e);
          console.log(doc);
          throw e;
        }
      });

      let end = 0;
      if (limit === -1) {
        end = count;
      } else {
        end = skip + limit;
        if (count < limit) end = count;
        if (count > skip && count < end) end = count;
      }

      const stats = [];
      const size = readableBytes(
        recs.reduce((a, b) => a + (b.video_details.size || 0), 0)
      );
      stats.push({ text: size });
      const duration = readableDuration(
        recs.reduce((a, b) => a + (b.video_details.duration || 0), 0)
      );
      stats.push({ text: duration });

      description = `${skip + 1} - ${parseInt(end, 10)} of ${count} recordings`;
      alert = {
        type: 'light',
        text: description,
        matches: steps,
        stats
      };

      updateState = {
        searchAlert: alert,
        recordCount: count,
        airingList
      };
    }

    sendResults({
      loading: false,
      searchAlert: alert,
      airingList
    });
    updateState.airingList = airingList;
    this.setStateStore({ ...updateState, ...{ emptySearch } });
  };

  render() {
    const {
      emptySearch,
      searchValue,
      stateFilter,
      typeFilter,
      watchedFilter,
      comskipFilter,
      cleanFilter,
      showFilter,
      seasonFilter,
      savedSearchFilter,
      sortFilter,
      seasonList,
      percent,
      recordCount,
      limit
    } = this.state;

    let { percentLocation } = this.state;

    const pctLabel = `${percent}%`;

    if (!percentLocation) percentLocation = 0;

    return (
      <>
        <Row>
          <Col>
            <div className="d-flex flex-row">
              <StateFilter onChange={this.stateChange} value={stateFilter} />
              <TypeFilter onChange={this.typeChange} value={typeFilter} />
              <WatchedFilter
                onChange={this.watchedChange}
                value={watchedFilter}
              />
              {comskipAvailable() ? (
                <ComskipFilter
                  onChange={this.comskipChange}
                  value={comskipFilter}
                />
              ) : (
                ''
              )}
              <CleanFilter onChange={this.cleanChange} value={cleanFilter} />
              <ShowFilter
                onChange={this.showChange}
                value={showFilter}
                shows={this.showsList}
              />
              {seasonList && seasonList.length > 0 ? (
                <SeasonFilter
                  onChange={this.seasonChange}
                  value={seasonFilter}
                  seasons={seasonList}
                />
              ) : (
                ''
              )}
            </div>
          </Col>
        </Row>
        <Row className="pt-3">
          <Col md="3">
            <InputGroup
              className="mb-3"
              size="sm"
              value={searchValue}
              onKeyPress={this.searchKeyPressed}
              onChange={this.searchChange}
            >
              <FormControl
                placeholder="Search..."
                aria-label="Search..."
                value={searchValue}
                onChange={this.searchChange}
                type="text"
              />

              <InputGroup.Append>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={this.search}
                >
                  Search
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
          <Col md="2" className="pt-1">
            <InputGroup size="sm" className="d-inline">
              <Button
                className="mb-3 mr-2"
                size="xs"
                variant="outline-dark"
                onClick={this.resetSearch}
              >
                <span className="fa fa-recycle pr-1" /> reset
              </Button>
              {!emptySearch ? (
                <SavedSearch
                  updateValue={this.savedSearchUpdate}
                  searchState={this.state}
                  recordCount={recordCount}
                  searches={this.savedSearchList}
                />
              ) : (
                ''
              )}
            </InputGroup>
          </Col>
          <Col md="4" className="">
            <Row>
              <Col className="p-0">
                <SavedSearchFilter
                  onChange={this.savedSearchChange}
                  value={savedSearchFilter}
                  searches={this.savedSearchList}
                />
              </Col>
              {savedSearchFilter !== '' ? (
                <Col md="auto" className="p-0 align-bottom">
                  <SavedSearchEdit
                    updateValue={this.savedSearchUpdate}
                    searchId={savedSearchFilter}
                    onClose={this.refresh}
                  />
                </Col>
              ) : (
                ''
              )}
            </Row>
          </Col>

          <Col md="3">
            <label
              className="smaller justify-content-center mb-3"
              style={{ width: '95%' }}
              id="pctLabel"
              htmlFor="customRange"
            >
              Percent Complete
              <Badge
                className="ml-2 p-1"
                size="md"
                variant="light"
                onClick={this.search}
              >
                {percent}%
              </Badge>
              <input
                type="range"
                name="customRange"
                className="custom-range"
                id="customRange"
                min="0"
                max="100"
                step="1"
                value={percent}
                title={pctLabel}
                onChange={this.percentDrag}
              />
            </label>
          </Col>
        </Row>

        <Row>
          <Col md="5" />
          <Col md="7">
            <Row>
              <Col md="8">
                {recordCount >= limit && limit !== -1 ? (
                  <ReactPaginate
                    previousLabel={
                      <span
                        className="fa fa-arrow-left"
                        title="previous page"
                      />
                    }
                    nextLabel={
                      <span className="fa fa-arrow-right" title="next page" />
                    }
                    breakLabel="..."
                    breakClassName="break-me"
                    pageCount={Math.ceil(recordCount / limit)}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={parseInt(limit, 10)}
                    onPageChange={this.handlePageClick}
                    containerClassName="pagination"
                    subContainerClassName="pages pagination"
                    activeClassName="active-page"
                  />
                ) : (
                  <></> //
                )}
              </Col>
              <Col md="3" className="mr-0">
                <div className="d-flex flex-row">
                  <PerPageFilter
                    value={`${limit}`}
                    onChange={this.updatePerPage}
                  />
                  <SortFilter
                    value={`${sortFilter}`}
                    onChange={this.sortChange}
                  />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <SearchResults />
      </> //
    );
  }
}

type filterProps = {
  value: string,
  onChange: Function,
  // eslint-disable-next-line react/no-unused-prop-types
  shows?: Array<Show>,
  // eslint-disable-next-line react/no-unused-prop-types
  seasons?: Array<Season>,
  // eslint-disable-next-line react/no-unused-prop-types
  searches?: Array<Object>
};

function StateFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    { value: 'any', label: 'any' },
    { value: 'finished', label: 'finished' },
    { value: 'recording', label: 'recording' },
    { value: 'failed', label: 'failed' }
  ];

  return (
    <FilterSelect
      name="stateFilter"
      placeholder="state"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
StateFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function TypeFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    { value: 'any', label: 'any' },
    { value: 'episode', label: 'episode' },
    { value: 'movie', label: 'movie' },
    { value: 'sports', label: 'sports' },
    { value: 'programs', label: 'programs' }
  ];

  return (
    <FilterSelect
      name="typeFilter"
      placeholder="type"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
TypeFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function WatchedFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    { value: 'all', label: 'all' },
    { value: 'yes', label: 'yes' },
    { value: 'no', label: 'no' }
  ];

  return (
    <FilterSelect
      name="watchedFilter"
      placeholder="watched"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
WatchedFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function ShowFilter(props: filterProps) {
  const { value, onChange, shows } = props;

  const options = [];
  options.push({ value: '', label: 'all' });
  if (shows && shows.length > 0) {
    shows.forEach(item =>
      options.push({
        value: item.path,
        label: (
          <>
            <TabloImage imageId={item.thumbnail} className="menu-image-small" />
            <span className="pl-1 pr-1">{item.title} </span>
            <Badge variant="secondary" pill>
              {item.showCounts.airing_count}
            </Badge>
          </>
        ) //
      })
    );
  }

  return (
    <FilterSelect
      name="showFilter"
      placeholder="show"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
ShowFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function SeasonFilter(props: filterProps) {
  const { value, onChange, seasons } = props;
  const options = [];
  options.push({ value: 'all', label: 'all' });
  if (seasons && seasons.length > 0) {
    seasons.forEach(item =>
      options.push({
        value: `${item.num}`,
        label: (
          <>
            <span className="pr-1">Season #{item.num}</span>
            <Badge variant="secondary" pill>
              {item.count}
            </Badge>
          </>
        ) //
      })
    );
  }

  return (
    <FilterSelect
      name="showFilter"
      placeholder="season"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
SeasonFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function ComskipFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    { value: 'all', label: 'all' },
    { value: 'ready', label: 'ready' },
    { value: 'failed', label: 'failed' }
  ];
  const types = [];
  // TODO: when this was async it belew up
  global.RecDb.find({}, (err, recs) => {
    recs.forEach(rec => {
      const cs = rec.video_details.comskip;
      // TODO: missing comskip?
      if (cs && cs.error) {
        if (!types.includes(cs.error)) {
          types.push(cs.error);
          options.push({ value: cs.error, label: cs.error });
        }
      }
    });
  });

  return (
    <FilterSelect
      name="comskipFilter"
      placeholder="comskip"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
ComskipFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function CleanFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    { value: 'any', label: 'any' },
    { value: 'clean', label: 'clean' },
    { value: 'dirty', label: 'dirty' }
  ];

  return (
    <FilterSelect
      name="cleanFilter"
      placeholder="clean"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}
CleanFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function SavedSearchFilter(props: filterProps) {
  const { value, onChange, searches } = props;

  const options = [];
  if (searches && searches.length > 0) {
    searches.forEach(item =>
      options.push({
        // eslint-disable-next-line no-underscore-dangle
        value: item._id,
        label: (
          <span className="pl-1">
            {item.name}
            <MatchesToBadges
              matches={item.state.searchAlert.matches}
              prefix="select-list"
              className="badge-sm"
            />
          </span>
        )
      })
    );
  } else {
    options.push({
      value: -1,
      label: '... once you save one!'
    });
  }

  return (
    <Select
      options={options}
      placeholder="use a saved search..."
      name="savedSearchFilter"
      onChange={onChange}
      styles={SelectStyles('30px', 250)}
      value={options.filter(option => option.value === value)}
    />
  );
}
SavedSearchFilter.defaultProps = { shows: [], seasons: [], searches: [] };

function SortFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    {
      value: SORT_REC_ASC,
      label: (
        <span>
          date
          <span className="fa fa-chevron-up pl-2 muted" />
        </span>
      )
    },
    {
      value: SORT_REC_DSC,
      label: (
        <span>
          date
          <span className="fa fa-chevron-down pl-2 muted" />
        </span>
      )
    },
    {
      value: SORT_SIZE_ASC,
      label: (
        <span>
          size
          <span className="fa fa-chevron-up pl-2 muted" />
        </span>
      )
    },
    {
      value: SORT_SIZE_DSC,
      label: (
        <span>
          size
          <span className="fa fa-chevron-down pl-2 muted" />
        </span>
      )
    },
    {
      value: SORT_DURATION_ASC,
      label: (
        <span>
          duration
          <span className="fa fa-chevron-up pl-2 muted" />
        </span>
      )
    },
    {
      value: SORT_DURATION_DSC,
      label: (
        <span>
          duration
          <span className="fa fa-chevron-down pl-2 muted" />
        </span>
      )
    }
  ];

  const height = '24px';
  const customStyles = {
    container: base => ({
      ...base,
      flex: 1,
      fontSize: '10px'
    }),
    control: provided => ({
      ...provided,
      height,
      minHeight: height,
      minWidth: 75,
      width: '100%',
      maxWidth: 600,
      background: '#fff',
      border: 0,
      marginLeft: '5px'
    }),
    valueContainer: provided => ({
      ...provided,
      height,
      paddingLeft: '10px'
    }),
    menu: provided => ({
      ...provided,
      minWidth: 75,
      width: '100%',
      maxWidth: 500,
      zIndex: '99999'
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '12px',
      borderBottom: '1px solid #CCC',
      padding: '10px 0 10px 5px',
      color: '#3E3F3A',
      backgroundColor: state.isSelected ? '#DBD8CC' : provided.backgroundColor
    }),
    indicatorSeparator: base => ({ ...base, display: 'none' }),
    dropdownIndicator: base => ({ ...base, display: 'none' })
  };

  return (
    <div>
      <div className="input-group input-group-sm" title="Sort...">
        <div>
          <Select
            options={options}
            name="sort"
            onChange={onChange}
            placeholder="sort by..."
            styles={customStyles}
            value={options.filter(option => `${option.value}` === `${value}`)}
            components={{ DropdownIndicator }}
          />
        </div>
      </div>
    </div>
  );
}
SortFilter.defaultProps = { shows: [], seasons: [], searches: [] };

const DropdownIndicator = props => {
  // eslint-disable-next-line react/prop-types
  const { selectProps } = props;
  // eslint-disable-next-line react/prop-types
  const { menuIsOpen } = selectProps;
  return (
    components.DropdownIndicator && (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <components.DropdownIndicator {...props}>
        {menuIsOpen ? (
          <span className="fa fa-chevron-up" />
        ) : (
          <span className="fa fa-chevron-down" />
        )}
      </components.DropdownIndicator>
    )
  );
};

function PerPageFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    { value: '-1', label: 'all' },
    { value: '10', label: '10' },
    { value: '50', label: '50' },
    { value: '100', label: '100' }
  ];
  const height = '24px';

  return (
    <div>
      <div className="input-group input-group-sm">
        <div>
          <Select
            options={options}
            name="per page"
            onChange={onChange}
            placeholder="per page"
            styles={SelectStyles(height, 75)}
            value={options.filter(option => `${option.value}` === `${value}`)}
          />
        </div>
      </div>
    </div>
  );
}
PerPageFilter.defaultProps = { shows: [], seasons: [], searches: [] };

type Option = {
  value: string,
  label: any
};

type fullFilterProps = {
  name: string,
  placeholder: string,
  options: Array<Option>,
  onChange: Function,
  value: string
};

function FilterSelect(props: fullFilterProps) {
  const { name, placeholder, options, onChange, value } = props;

  const height = '30px';
  let maxLen = 0;
  options.forEach(item => {
    const len = item.label.length * 15;
    if (len > maxLen) maxLen = len;
  });
  // TODO: cheeeeating.
  if (name === 'showFilter') maxLen = 300;

  return (
    <div>
      <div className="input-group input-group-sm">
        <div className="input-group-prepend ">
          <span className="input-group-text">{placeholder}</span>
        </div>
        <div>
          <Select
            options={options}
            placeholder={placeholder}
            name={name}
            onChange={onChange}
            styles={SelectStyles(height, maxLen)}
            value={options.filter(option => option.value === value)}
          />
        </div>
      </div>
    </div>
  );
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(SearchActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  null,
  mapDispatchToProps
)(withRouter(SearchForm));

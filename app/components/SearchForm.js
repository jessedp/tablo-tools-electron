// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

import ReactPaginate from 'react-paginate';
import Select from 'react-select';

import { asyncForEach, throttleActions } from '../utils/utils';
import Airing, { ensureAiringArray } from '../utils/Airing';
import Show from '../utils/Show';
import ConfirmDelete from './ConfirmDelete';
import { CHECKBOX_OFF } from './Checkbox';
import { showList } from './ShowsList';
import VideoExport from './VideoExport';
import TabloImage from './TabloImage';
import type { SearchAlert } from './Search';

type Props = {
  sendResults: Object => void,
  sendSelectAll: () => void,
  sendUnselectAll: () => void,
  toggleItem: (Airing, number) => void
};

type Season = {
  num: number,
  count: number
};

type State = {
  skip: number,
  limit: number,
  searchValue: string,
  typeFilter: string,
  stateFilter: string,
  watchedFilter: string,
  showFilter: string,
  seasonFilter: string,
  comskipFilter: string,
  view: string,
  percent: number,
  percentLocation: number,
  recordCount: number,
  searchAlert: SearchAlert,
  airingList: Array<Airing>,
  actionList: Array<Airing>,
  seasonList: Array<Season>
};

export default class SearchForm extends Component<Props, State> {
  props: Props;

  initialState: State;

  showsList: Array<Show>;

  psToken: null;

  constructor() {
    super();

    this.initialState = {
      skip: 0,
      limit: 50,
      searchValue: '',
      typeFilter: 'any',
      stateFilter: 'any',
      watchedFilter: 'all',
      comskipFilter: 'all',
      showFilter: '',
      seasonFilter: '',
      view: 'search',
      percent: 100,
      percentLocation: 0,
      recordCount: 0,
      searchAlert: {
        type: '',
        text: '',
        matches: []
      },
      airingList: [],
      actionList: [],
      seasonList: []
    };

    const storedState = JSON.parse(localStorage.getItem('SearchState') || '{}');

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

    this.search = this.search.bind(this);
    this.resetSearch = this.resetSearch.bind(this);

    this.stateChange = this.stateChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.watchedChange = this.watchedChange.bind(this);
    this.showChange = this.showChange.bind(this);
    this.seasonChange = this.seasonChange.bind(this);
    this.viewChange = this.viewChange.bind(this);
    this.searchChange = this.searchChange.bind(this);
    this.searchKeyPressed = this.searchKeyPressed.bind(this);

    this.percentDrag = this.percentDrag.bind(this);

    this.addItem = this.addItem.bind(this);
    this.delItem = this.delItem.bind(this);
    this.emptyItems = this.emptyItems.bind(this);

    this.selectAll = this.selectAll.bind(this);
    this.unselectAll = this.unselectAll.bind(this);
    this.deleteAll = this.deleteAll.bind(this);

    (this: any).handlePageClick = this.handlePageClick.bind(this);
    (this: any).updatePerPage = this.updatePerPage.bind(this);
    (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
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
    const { view, actionList, searchAlert } = this.state;
    this.showsList = await showList();
    const { length } = actionList;
    if (view === 'selected' && length >= 0) {
      this.setState({
        searchAlert: {
          type: 'light',
          text: searchAlert.text,
          matches: searchAlert.matches
        }
      });
      this.viewChange();
    } else {
      await this.search();
    }
  }

  viewChange = async () => {
    const { sendResults } = this.props;
    const { actionList } = this.state;
    let { searchAlert } = this.state;

    const len = actionList.length;
    if (len === 0) return;

    await sendResults({
      loading: true,
      airingList: [],
      searchAlert: this.initialState.searchAlert
    });

    // descending
    const timeSort = (a, b) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    actionList.sort((a, b) => timeSort(a, b));

    searchAlert = {
      type: 'light',
      text: `${len} selected recordings `,
      matches: []
    };

    this.setState({
      view: 'selected',
      searchAlert
    });

    sendResults({
      loading: false,
      airingList: actionList,
      searchAlert,
      actionList
    });

    const cleanState = { ...this.state };
    localStorage.setItem('SearchState', JSON.stringify(cleanState));
  };

  addItem = (item: Airing) => {
    const { actionList } = this.state;
    if (!actionList.find(rec => rec.object_id === item.object_id)) {
      actionList.push(item);
      this.setState({ actionList });
    }
  };

  delItem = (item: Airing) => {
    let { actionList } = this.state;
    actionList = actionList.filter(
      airing => airing.object_id !== item.object_id
    );
    this.setState({ actionList });
  };

  selectAll = () => {
    const { sendSelectAll } = this.props;
    const { airingList } = this.state;
    sendSelectAll();
    airingList.forEach(airing => {
      this.addItem(airing);
    });
  };

  unselectAll = () => {
    const { sendUnselectAll } = this.props;
    // const { airingList } = this.state;
    sendUnselectAll();
    this.setState({ actionList: [] });
  };

  emptyItems = () => {
    const { sendUnselectAll, toggleItem } = this.props;
    const { actionList } = this.state;
    actionList.forEach(item => {
      toggleItem(item, CHECKBOX_OFF);
    });
    sendUnselectAll();
    this.setState({ actionList: [] });
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
          this.search(true);
        }, 1000);
        return false;
      })
      .catch(result => {
        console.log('deleteAll failed', result);
        return false;
      });
  };

  resetSearch = async () => {
    const { actionList } = this.state;
    const newState = this.initialState;
    newState.actionList = actionList;
    await this.setStateStore(newState);
    await this.search();
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

  search = async (resetActionList?: boolean) => {
    const { sendResults } = this.props;
    let { actionList } = this.state;

    const {
      skip,
      limit,
      view,
      percent,
      searchValue,
      stateFilter,
      typeFilter,
      watchedFilter,
      comskipFilter,
      showFilter,
      seasonFilter
    } = this.state;

    const query = {};
    const steps = [];

    if (resetActionList === true) {
      actionList = [];
    }

    if (searchValue) {
      const escapeRegExp = (text: string) => {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
      };
      const re = new RegExp(escapeRegExp(searchValue), 'i');
      // query['airing_details.show_title'] =  { $regex: re };
      query.$or = [
        { 'airing_details.show_title': { $regex: re } },
        { 'episode.title': { $regex: re } },
        { 'episode.description': { $regex: re } },
        { 'event.title': { $regex: re } },
        { 'event.description': { $regex: re } }
      ];

      if (typeFilter !== 'any') {
        const typeRe = new RegExp(typeFilter, 'i');
        query.path = { $regex: typeRe };

        steps.push({
          type: 'type',
          value: typeFilter,
          text: `is: ${typeFilter}`
        });
      }

      steps.push({
        type: 'search',
        value: searchValue,
        text: `title or description contains "${searchValue}"`
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
    // console.log(query);

    const count = await global.RecDb.asyncCount(query);
    const projection = [];
    projection.push(['sort', { 'airing_details.datetime': -1 }]);
    if (limit !== 'all') {
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
        view: 'search',
        actionList,
        airingList
      };
    } else {
      // sendResults({
      //   loading: true,
      //   searchAlert: alert
      // });

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
      if (limit === 'all') {
        end = count;
      } else {
        end = skip + limit;
        if (count < limit) end = count;
        if (count > skip && count < end) end = count;
      }

      description = `${skip + 1} - ${parseInt(end, 10)} of ${count} recordings`;
      alert = {
        type: 'light',
        text: description,
        matches: steps
      };
      updateState = {
        searchAlert: alert,
        recordCount: count,
        view: 'search',
        actionList,
        airingList
      };
    }

    sendResults({
      loading: false,
      view,
      searchAlert: alert,
      airingList,
      actionList
    });
    updateState.airingList = airingList;

    this.setStateStore(updateState);
  };

  render() {
    const {
      searchValue,
      stateFilter,
      typeFilter,
      watchedFilter,
      comskipFilter,
      showFilter,
      seasonFilter,
      actionList,
      seasonList,
      view,
      percent,
      recordCount,
      limit
    } = this.state;
    let { percentLocation } = this.state;

    const pctLabel = `${percent}%`;

    if (!percentLocation) percentLocation = 0;

    let selectControl = (
      <Col md="2">
        <SelectedDisplay actionList={actionList} view={this.viewChange} />
      </Col>
    );
    if (view === 'selected') selectControl = '';

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
              <ComskipFilter
                onChange={this.comskipChange}
                value={comskipFilter}
              />
              <ShowFilter
                onChange={this.showChange}
                value={showFilter}
                shows={this.showsList}
              />
              {seasonList.length > 0 ? (
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
                className="mb-3 mr-3"
                size="xs"
                variant="outline-dark"
                onClick={this.resetSearch}
              >
                <span className="fa fa-recycle pr-1" /> reset
              </Button>
            </InputGroup>
          </Col>
          <Col md="7">
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
          {selectControl}
          {view !== 'selected' ? (
            <>
              <Col className="pt-1" md="3">
                <Button
                  variant="outline-info"
                  size="xs"
                  onClick={this.selectAll}
                >
                  <span
                    className="fa fa-plus pr-1"
                    style={{ color: 'green' }}
                  />
                  all
                </Button>
                &nbsp;
                <Button
                  variant="outline-info"
                  size="xs"
                  onClick={this.unselectAll}
                >
                  <span className="fa fa-minus pr-1" style={{ color: 'red' }} />
                  all
                </Button>
                &nbsp;
                <Button
                  variant="outline-danger"
                  size="xs"
                  onClick={this.emptyItems}
                >
                  <span className="fa fa-times-circle pr-1" />
                  empty
                </Button>
              </Col>
              <Col>
                <Row>
                  <Col>
                    {recordCount >= limit ? (
                      <ReactPaginate
                        previousLabel={
                          <span
                            className="fa fa-arrow-left"
                            title="previous page"
                          />
                        }
                        nextLabel={
                          <span
                            className="fa fa-arrow-right"
                            title="next page"
                          />
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
                      <></>
                    )}
                  </Col>
                  <Col md="2" className="mr-3">
                    <PerPageFilter
                      value={`${limit}`}
                      onChange={this.updatePerPage}
                    />
                  </Col>
                </Row>
              </Col>
            </>
          ) : (
            ''
          )}

          {view === 'selected' ? (
            <>
              <Col md="1">
                <Col md="2" className="pt-1">
                  <Button
                    variant="outline-secondary"
                    size="xs"
                    onClick={this.search}
                    title="Back"
                  >
                    <span className="fa fa-arrow-left" />
                  </Button>
                </Col>
              </Col>
              <Col md="2" className="pt-1">
                <ConfirmDelete
                  airingList={actionList}
                  onDelete={this.deleteAll}
                  label="delete selected"
                />
              </Col>
              <Col className="pt-1">
                <VideoExport airingList={actionList} label="export selected" />
              </Col>
            </>
          ) : (
            ''
          )}
        </Row>
      </>
    );
  }
}

function SelectedDisplay(prop) {
  const { actionList, view } = prop;

  const len = actionList.length;

  return (
    <Button onClick={view} variant="outline-primary" style={{ width: '125px' }}>
      <span className="fa fa-file-video" /> {len} selected
    </Button>
  );
}

type filterProps = {
  value: string,
  onChange: Function,
  // eslint-disable-next-line react/no-unused-prop-types
  shows?: Array<Show>,
  // eslint-disable-next-line react/no-unused-prop-types
  seasons?: Array<Season>
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
StateFilter.defaultProps = { shows: [], seasons: [] };

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
TypeFilter.defaultProps = { shows: [], seasons: [] };

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
WatchedFilter.defaultProps = { shows: [], seasons: [] };

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
        )
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
ShowFilter.defaultProps = { shows: [], seasons: [] };

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
        )
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
SeasonFilter.defaultProps = { shows: [], seasons: [] };

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
ComskipFilter.defaultProps = { shows: [], seasons: [] };

function PerPageFilter(props: filterProps) {
  const { value, onChange } = props;

  const options = [
    { value: 'all', label: 'all' },
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
            styles={FilterStyles(height, 75)}
            value={options.filter(option => `${option.value}` === `${value}`)}
          />
        </div>
      </div>
    </div>
  );
}
PerPageFilter.defaultProps = { shows: [], seasons: [] };

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
            styles={FilterStyles(height, maxLen)}
            value={options.filter(option => option.value === value)}
          />
        </div>
      </div>
    </div>
  );
}

const FilterStyles = (height: string, width?: number) => {
  return {
    container: base => ({
      ...base,
      flex: 1
    }),
    control: (provided, state) => ({
      ...provided,
      height,
      minHeight: height,
      minWidth: 75,
      width: '100%',
      maxWidth: 600,
      background: '#fff',
      borderColor: '#9e9e9e',
      boxShadow: state.isFocused ? null : null,
      borderRadius: '1px',
      color: '#CCC',
      fontSize: 12
      // margin: 0,
      // padding: '1px'
    }),
    valueContainer: provided => ({
      ...provided,
      height,
      padding: '0 3px'
    }),
    menu: provided => ({
      ...provided,
      minWidth: width || 50,
      width: '100%',
      maxWidth: 500,
      zIndex: '99999'
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '12px',
      color: '#3E3F3A',
      borderBottom: '1px dotted #8E8C84',
      backgroundColor: state.isSelected ? '#DBD8CC' : provided.backgroundColor,
      overflowX: 'hidden'
    }),
    input: provided => ({
      ...provided,
      margin: '0px'
    }),
    singleValue: () => ({
      color: 'hsl(0, 0%, 50%)'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    indicatorsContainer: provided => ({
      ...provided,
      height
    })
  };
};

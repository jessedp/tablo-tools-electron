import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import PubSub from 'pubsub-js';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';

import ReactPaginate from 'react-paginate';

import { EMPTY_SEARCHALERT, ViewType, VIEW_GRID } from '../constants/app';
import {
  asyncForEach,
  escapeRegExp,
  readableBytes,
  readableDuration,
  throttleActions,
} from '../utils/utils';
import Airing, { ensureAiringArray } from '../utils/Airing';
import Show from '../utils/Show';
import { showList } from '../utils/dbHelpers';

import type { QryStep, SearchAlert } from '../constants/types';
import { comskipAvailable } from '../utils/Tablo';
import SavedSearch from './SavedSearch';

import SavedSearchEdit from './SavedSearchEdit';
import * as SearchActions from '../store/search';
import SearchResults from './SearchResults';

import {
  CleanFilter,
  ComskipFilter,
  PerPageFilter,
  SavedSearchFilter,
  SeasonFilter,
  ShowFilter,
  SortFilter,
  StateFilter,
  TypeFilter,
  ViewFilter,
  WatchedFilter,
  SORT_DURATION_ASC,
  SORT_DURATION_DSC,
  SORT_REC_ASC,
  SORT_REC_DSC,
  SORT_SIZE_ASC,
  SORT_SIZE_DSC,
  Option,
  Season,
} from './SearchFilters';

type OwnProps = Record<string, any>;
type StateProps = Record<string, any>;

type DispatchProps = {
  setLoading: (arg: boolean) => void;
  setView: (arg: ViewType) => void;
  setAlert: (arg: SearchAlert) => void;
  setResults: (arg: SearchActions.SearchSliceState) => void;
};

type SearchFormProps = OwnProps & StateProps & DispatchProps;

export type SearchState = {
  emptySearch: boolean;
  skip: number;
  limit: number;
  view: ViewType;
  searchValue: string;
  typeFilter: string;
  stateFilter: string;
  watchedFilter: string;
  showFilter: string;
  seasonFilter: string;
  comskipFilter: string;
  cleanFilter: string;
  savedSearchFilter: string;
  sortFilter: number;
  percent: number;
  percentLocation: number;
  recordCount: number;
  searchAlert: SearchAlert;
  airingList: Array<Record<string, any>>;
  actionList: Array<Airing>;
  seasonList: Array<Season>;
};

class SearchForm extends Component<
  SearchFormProps & RouteComponentProps,
  SearchState
> {
  initialState: SearchState;

  showsList: Array<Show>;

  savedSearchList: Array<Record<string, any>>; // TODO: savedSearchList type

  psToken: string;

  percentDragTimeout: NodeJS.Timeout | null | undefined = null;

  percentDragSearchTimeout: NodeJS.Timeout | null | undefined = null;

  constructor(props: SearchFormProps & RouteComponentProps) {
    super(props);
    this.initialState = {
      emptySearch: true,
      skip: 0,
      limit: 50,
      view: VIEW_GRID,
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
      seasonList: [],
    };
    this.psToken = '';

    const storedState = JSON.parse(
      window.electron.store.get('SearchState') || '{}'
    );
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
    (this as any).sortChange = this.sortChange.bind(this);
    (this as any).handlePageClick = this.handlePageClick.bind(this);
    (this as any).updatePerPage = this.updatePerPage.bind(this);
    (this as any).changeView = this.changeView.bind(this);
    (this as any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    const { setView } = this.props;
    const { view } = this.state;

    // v0.1.12 - make sure we have Airings
    let { actionList } = this.state;
    actionList = await ensureAiringArray(actionList);
    this.savedSearchList = await window.db.findAsync('SearchDb', {});
    await this.setState({
      actionList,
    });

    setView(view);
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    const cleanState = { ...this.state };
    PubSub.unsubscribe(this.psToken);
    window.electron.store.set('SearchState', JSON.stringify(cleanState));
  }

  async handlePageClick(data: { selected: number }) {
    const { setLoading } = this.props;
    const { limit } = this.state;
    // this.setState( {skip: 0 });
    const { selected } = data;
    const offset = Math.ceil(selected * limit);
    this.setState(
      {
        skip: offset,
      },
      () => {
        setLoading(true);
        this.search();
      }
    );
  }

  setStateStore() {
    const cleanState = this.state;
    window.electron.store.set('SearchState', JSON.stringify(cleanState));
  }

  updatePerPage = async (event: Option) => {
    await this.setState({
      limit: parseInt(event.value, 10),
    });
    this.search();
  };

  changeView = async (event: Option) => {
    const { setLoading, setView } = this.props;
    await this.setState({
      view: event.value as ViewType,
    });
    setLoading(true);
    setView(event.value as ViewType);
    this.search();
  };

  showSelected = async () => {
    const { setResults } = this.props;
    const { view, actionList } = this.state;
    let { searchAlert } = this.state;
    console.log('showSelected');
    const len = actionList.length;
    if (len === 0) return;

    setResults({
      loading: true,
      results: [],
      searchAlert: this.initialState.searchAlert,
      view,
    });

    const timeSort = (a: Airing, b: Airing) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    const stats = [];
    actionList.sort((a, b) => timeSort(a, b));
    const size = readableBytes(
      actionList.reduce(
        (a: number, b: Airing) => a + (b.videoDetails.size || 0),
        0
      )
    );
    stats.push({
      text: size,
    });
    const duration = readableDuration(
      actionList.reduce(
        (a: number, b: Airing) => a + (b.videoDetails.duration || 0),
        0
      )
    );
    stats.push({
      text: duration,
    });
    searchAlert = {
      type: 'light',
      text: `${len} selected recordings`,
      matches: [],
      stats,
    };
    this.setState({
      searchAlert,
    });

    setResults({
      loading: true,
      results: [],
      searchAlert: this.initialState.searchAlert,
    });

    const cleanState = { ...this.state };
    window.electron.store.set('SearchState', JSON.stringify(cleanState));
  };

  deleteAll = async (countCallback: (...args: Array<any>) => any) => {
    let { actionList } = this.state;
    actionList = ensureAiringArray(actionList);
    const list: Array<() => void> = [];
    actionList.forEach((item) => {
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
      .catch((result) => {
        console.log('deleteAll failed', result);
        return false;
      });
  };

  resetSearch = async () => {
    const { setLoading } = this.props;
    const { actionList, view, sortFilter, limit } = this.state;
    const newState = { ...this.initialState };
    newState.actionList = actionList;
    newState.sortFilter = sortFilter;
    newState.limit = limit;
    newState.view = view;
    await this.setState(newState);
    this.setStateStore();
    setLoading(true);
    this.refresh();
  };

  stateChange = async (event: Option) => {
    await this.setState({
      stateFilter: event.value,
    });
    this.search();
  };

  typeChange = async (event: Option) => {
    await this.setState({
      typeFilter: event.value,
    });
    this.search();
  };

  watchedChange = async (event: Option) => {
    await this.setState({
      watchedFilter: event.value,
    });
    this.search();
  };

  comskipChange = async (event: Option) => {
    await this.setState({
      comskipFilter: event.value,
    });
    this.search();
  };

  sortChange = async (event: Option) => {
    await this.setState({
      sortFilter: parseInt(event.value, 10),
    });
    this.search();
  };

  cleanChange = async (event: Option) => {
    await this.setState({
      cleanFilter: event.value,
    });
    this.search();
  };

  showChange = async (event: Option) => {
    await this.setState({
      showFilter: event.value,
    });
    const list: Array<{ num: number; count: number }> = [];

    if (event.value !== '' && event.value !== 'all') {
      // load seasons for show
      const query = {
        series_path: event.value,
      };
      const seasons: Record<number, number> = {};
      const recs = await window.db.findAsync('RecDb', query);
      await asyncForEach(recs, async (rec) => {
        const airing = await Airing.create(rec);
        const num = airing.episode.season_number;
        if (seasons[num]) seasons[num] += 1;
        else seasons[num] = 1;
      });
      Object.keys(seasons).forEach((key: string) => {
        list.push({
          num: parseInt(key, 10),
          count: seasons[parseInt(key, 10)],
        });
      });
    }

    await this.setState({
      seasonList: list,
    });
    this.search();
  };

  seasonChange = async (event: Option) => {
    await this.setState({
      seasonFilter: event.value,
    });
    this.search();
  };

  updateSavedSearch = async (searchId = '') => {
    const { savedSearchFilter } = this.state;
    this.savedSearchList = await window.db.findAsync('SearchDb', {});

    if (!searchId) {
      await this.resetSearch();
    }

    const rec = await window.db.findOneAsync('SearchDb', {
      _id: searchId,
    });

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

  savedSearchUpdate = async (searchId: string): Promise<void> => {
    this.updateSavedSearch(searchId);
  };

  // searchChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
  searchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.currentTarget.value && event.currentTarget.value !== '') return;
    this.setState({
      searchValue: event.currentTarget.value,
    });
  };

  searchKeyPressed = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { setLoading } = this.props;

    if (event.key === 'Enter') {
      setLoading(true);
      await this.search();
    }
  };

  // React.ChangeEvent<HTMLInputElement>
  // percentDrag = (event: React.DragEvent<HTMLInputElement>) => {
  percentDrag = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event) return;
    this.setState({
      percent: parseInt(event.currentTarget.value, 10),
    });
    this.setStateStore();
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
      if (xPos)
        await this.setState({
          percentLocation: xPos,
        });
      this.setStateStore();
    }, 10);
    this.percentDragSearchTimeout = setTimeout(async () => {
      this.search();
    }, 1000);
  };

  search = async () => {
    const { setAlert, setResults } = this.props;
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
      sortFilter,
    } = this.state;
    const query: Record<string, any> = {};

    const steps: QryStep[] = [];

    if (searchValue.trim()) {
      const re = new RegExp(escapeRegExp(searchValue), 'i');
      // query['airing_details.show_title'] =  { $regex: re };
      query.$or = [
        {
          'airing_details.show_title': {
            $regex: re,
          },
        },
        {
          'episode.title': {
            $regex: re,
          },
        },
        {
          'episode.description': {
            $regex: re,
          },
        },
        {
          'event.title': {
            $regex: re,
          },
        },
        {
          'event.description': {
            $regex: re,
          },
        },
      ];

      steps.push({
        type: 'search',
        value: searchValue,
        text: `title or description contains "${searchValue}"`,
      });
    }

    if (typeFilter !== 'any') {
      const typeRe = new RegExp(typeFilter, 'i');
      query.path = {
        $regex: typeRe,
      };
      steps.push({
        type: 'type',
        value: typeFilter,
        text: `is: ${typeFilter}`,
      });
    }

    if (stateFilter !== 'any') {
      query['video_details.state'] = stateFilter;
      steps.push({
        type: 'state',
        value: stateFilter,
        text: `${stateFilter}`,
      });
    }

    if (cleanFilter !== 'any') {
      query['video_details.clean'] = cleanFilter !== 'dirty';
      steps.push({
        type: 'clean',
        value: cleanFilter,
        text: `is ${cleanFilter}`,
      });
    }

    if (watchedFilter !== 'all') {
      let text = 'not watched';
      if (watchedFilter === 'yes') {
        query['user_info.watched'] = true;
        text = 'watched';
      } else if (watchedFilter === 'no') {
        query['user_info.watched'] = false;
        text = 'not watched';
      } else if (watchedFilter === 'partial') {
        query['user_info.position'] = {
          $gt: 0,
        };
        text = 'partially watched';
      }

      steps.push({
        type: 'watched',
        value: watchedFilter,
        text,
      });
    }

    if (comskipFilter !== 'all') {
      let text = 'comskip is not ready';

      if (comskipFilter === 'ready') {
        query['video_details.comskip.state'] = 'ready';
        text = 'comskip is ready';
      } else if (comskipFilter === 'failed') {
        query['video_details.comskip.state'] = {
          $ne: 'ready',
        };
      } else {
        query['video_details.comskip.error'] = comskipFilter;
        text = `comskip failed b/c ${comskipFilter}`;
      }

      steps.push({
        type: 'comskip',
        value: comskipFilter,
        text,
      });
    }

    if (showFilter !== '' && showFilter !== 'all') {
      const show = this.showsList.find((item) => item.path === showFilter);
      query.series_path = showFilter;
      steps.push({
        type: 'show',
        value: showFilter,
        text: `show is ${show ? show.title : 'Unknown'}`,
      });

      if (seasonFilter !== '' && seasonFilter !== 'all') {
        // / seasonList
        query['episode.season_number'] = parseInt(seasonFilter, 10);
        steps.push({
          type: 'season',
          value: seasonFilter,
          text: `season #${seasonFilter}`,
        });
      }
    }

    const emptySearch = Object.keys(query).length === 0;
    const count = await window.db.countAsync('RecDb', query);
    const projection = [];

    switch (sortFilter) {
      case SORT_DURATION_ASC:
        projection.push([
          'sort',
          {
            'video_details.duration': 1,
          },
        ]);
        break;

      case SORT_DURATION_DSC:
        projection.push([
          'sort',
          {
            'video_details.duration': -1,
          },
        ]);
        break;

      case SORT_SIZE_ASC:
        projection.push([
          'sort',
          {
            'video_details.size': 1,
          },
        ]);
        break;

      case SORT_SIZE_DSC:
        projection.push([
          'sort',
          {
            'video_details.size': -1,
          },
        ]);
        break;

      case SORT_REC_ASC:
        projection.push([
          'sort',
          {
            'airing_details.datetime': 1,
          },
        ]);
        break;

      case SORT_REC_DSC:
      default:
        projection.push([
          'sort',
          {
            'airing_details.datetime': -1,
          },
        ]);
    }

    let newLimit = limit;
    newLimit = Number.isNaN(limit) ? this.initialState.limit : limit;

    if (newLimit !== -1) {
      projection.push(['skip', skip]);
      projection.push(['limit', limit]);
    }

    let recs = await window.db.findAsync('RecDb', query, projection);

    if (percent < 100) {
      const pct = percent / 100;
      recs = recs.filter(
        (rec: Record<string, any>) =>
          rec.airing_details.duration * pct >= rec.video_details.duration
      );
      steps.push({
        type: 'complete',
        value: percent,
        text: `${percent}% or less complete`,
      });
    }

    const airingList: Record<string, any>[] = [];
    let description;
    let updateState;
    let alert: SearchAlert;

    if (!recs || recs.length === 0) {
      description = `No records found`;
      alert = {
        type: 'warning',
        text: description,
        matches: steps,
      };
      updateState = {
        searchAlert: alert,
        airingList,
        recordCount: 0,
      };
    } else {
      setAlert(this.initialState.searchAlert);

      await asyncForEach(recs, async (doc) => {
        try {
          airingList.push(doc);
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

      const stats: Array<Record<string, any>> = [];
      const size = readableBytes(
        recs.reduce(
          (a: number, b: Record<string, any>) =>
            a + (b.video_details.size || 0),
          0
        )
      );
      stats.push({
        text: size,
      });
      const duration = readableDuration(
        recs.reduce(
          (a: number, b: Record<string, any>) =>
            a + (b.video_details.duration || 0),
          0
        )
      );
      stats.push({
        text: duration,
      });
      description = `${skip + 1} - ${end} of ${count} recordings`;
      alert = {
        type: 'light',
        text: description,
        matches: steps,
        stats,
      };
      updateState = {
        searchAlert: alert,
        recordCount: count,
        airingList,
      };
    }

    setResults({
      loading: false,
      results: airingList,
      searchAlert: alert,
    });

    updateState.airingList = airingList;
    await this.setState({
      ...updateState,
      ...{
        emptySearch,
      },
    });
    this.setStateStore();
  };

  async refresh(): Promise<void> {
    this.showsList = await showList();
    this.savedSearchList = await window.db.findAsync('SearchDb', {});
    this.search();
  }

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
      limit,
      view,
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
          <Col md="2" className="pt-1 pr-0">
            <InputGroup size="sm" className="d-inline">
              <Button
                className="mb-3 mr-1"
                size={'xs' as any}
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
                    searchId={savedSearchFilter}
                    updateValue={this.savedSearchUpdate}
                    resetValue={this.refresh}
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
              style={{
                width: '95%',
              }}
              id="pctLabel"
              htmlFor="customRange"
            >
              Percent Complete
              <Badge className="ml-2 p-1" variant="light" onClick={this.search}>
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

        <Row className="">
          <Col md="9">
            {
              recordCount >= limit && limit !== -1 ? (
                <ReactPaginate
                  previousLabel={
                    <span className="fa fa-arrow-left" title="previous page" />
                  }
                  nextLabel={
                    <span className="fa fa-arrow-right" title="next page" />
                  }
                  breakLabel="..."
                  breakClassName="break-me"
                  pageCount={Math.ceil(recordCount / limit)}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={limit}
                  onPageChange={this.handlePageClick}
                  containerClassName="pagination"
                  activeClassName="active-page"
                />
              ) : (
                <></>
              ) //
            }
          </Col>
          <Col md="3" className="">
            <div className="d-flex flex-row-reverse mr-3">
              <ViewFilter value={`${view}`} onChange={this.changeView} />
              <SortFilter value={`${sortFilter}`} onChange={this.sortChange} />
              <PerPageFilter value={`${limit}`} onChange={this.updatePerPage} />
            </div>
          </Col>
        </Row>

        <SearchResults />
      </> //
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(SearchActions, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  null,
  mapDispatchToProps
)(withRouter(SearchForm));

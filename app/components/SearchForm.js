// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

import { RecDb } from '../utils/db';
import { asyncForEach } from '../utils/utils';
import Airing, { ensureAiringArray } from '../utils/Airing';
import Show from '../utils/Show';
import ConfirmDelete from './ConfirmDelete';
import { CHECKBOX_OFF } from './Checkbox';
import { showList } from './ShowsList';
import VideoExport from './VideoExport';

type Props = {
  sendResults: Object => void,
  sendSelectAll: () => void,
  sendUnselectAll: () => void,
  toggleItem: (Airing, number) => void
};

type State = {
  searchValue: string,
  typeFilter: string,
  stateFilter: string,
  watchedFilter: string,
  showFilter: string,
  comskipFilter: string,
  view: string,
  alert: {
    type: string,
    text: string,
    match: string
  },
  airingList: Array<Airing>,
  actionList: Array<Airing>
};

export default class SearchForm extends Component<Props, State> {
  props: Props;

  initialState: State;

  showsList: Array<Show>;

  constructor() {
    super();

    this.initialState = {
      searchValue: '',
      typeFilter: 'any',
      stateFilter: 'any',
      watchedFilter: 'all',
      comskipFilter: 'all',
      view: 'grid',
      showFilter: '',
      alert: { type: '', text: '', match: '' },
      airingList: [],
      actionList: []
    };

    const storedState = JSON.parse(localStorage.getItem('SearchState') || '{}');
    delete storedState.recordingRefs;
    const initialStateCopy = { ...this.initialState };
    this.state = Object.assign(initialStateCopy, storedState);
    this.showsList = [];

    this.search = this.search.bind(this);
    this.resetSearch = this.resetSearch.bind(this);

    this.stateChange = this.stateChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.watchedChange = this.watchedChange.bind(this);
    this.showChange = this.showChange.bind(this);
    this.viewChange = this.viewChange.bind(this);
    this.searchChange = this.searchChange.bind(this);
    this.searchKeyPressed = this.searchKeyPressed.bind(this);

    this.addItem = this.addItem.bind(this);
    this.delItem = this.delItem.bind(this);
    this.emptyItems = this.emptyItems.bind(this);

    this.selectAll = this.selectAll.bind(this);
    this.unselectAll = this.unselectAll.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
  }

  async componentDidMount() {
    const { view, actionList, alert } = this.state;
    this.showsList = await showList();
    const { length } = actionList;
    if (view === 'selected' && length >= 0) {
      this.setState({
        alert: { type: 'light', text: alert.text, match: alert.match }
      });
      this.viewChange();
    } else {
      await this.search();
    }
  }

  componentWillUnmount() {
    const cleanState = { ...this.state };
    localStorage.setItem('SearchState', JSON.stringify(cleanState));
  }

  setStateStore(...args: Array<Object>) {
    const values = args[0];

    this.setState(values);
    const cleanState = this.state;

    localStorage.setItem('SearchState', JSON.stringify(cleanState));
  }

  viewChange = async () => {
    const { sendResults } = this.props;
    const { actionList } = this.state;

    const len = actionList.length;
    if (len === 0) return;

    await sendResults({ loading: true, airingList: [] });

    /**
    const list = Object.keys(actionList).map(item => {
      return Object.assign(new Airing(), actionList[item]);
    });
     */

    // descending
    const timeSort = (a, b) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    actionList.sort((a, b) => timeSort(a, b));

    this.setState({
      view: 'selected',
      alert: { type: 'light', text: `${len} selected recordings`, match: '' }
    });

    sendResults({
      loading: false,
      airingList: actionList,
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

  deleteAll = async () => {
    let { actionList } = this.state;
    actionList = ensureAiringArray(actionList);
    actionList.forEach(item => {
      const rec = Object.assign(new Airing(), item);
      rec.delete();
    });
    this.setState({ view: 'grid', actionList: [] });
    await this.search();
  };

  resetSearch = async () => {
    const { actionList } = this.state;
    const newState = this.initialState;
    newState.actionList = actionList;
    await this.setStateStore(newState);
    await this.search();
  };

  stateChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ stateFilter: event.currentTarget.value });
    this.search();
  };

  typeChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ typeFilter: event.currentTarget.value });
    this.search();
  };

  watchedChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ watchedFilter: event.currentTarget.value });
    this.search();
  };

  comskipChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ comskipFilter: event.currentTarget.value });
    this.search();
  };

  showChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ showFilter: event.currentTarget.value });
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

  search = async () => {
    const { actionList, view } = this.state;
    const { sendResults } = this.props;

    const {
      searchValue,
      stateFilter,
      typeFilter,
      watchedFilter,
      comskipFilter,
      showFilter
    } = this.state;

    const query = {};
    const steps = [];

    if (searchValue) {
      const re = new RegExp(searchValue, 'i');
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
        text: `where title or description contains "${searchValue}`
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

    if (typeFilter !== 'any') {
      const typeRe = new RegExp(typeFilter, 'i');
      query.path = { $regex: typeRe };

      steps.push({
        type: 'type',
        value: typeFilter,
        text: `${typeFilter}`
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
      } else {
        query['video_details.comskip.state'] = { $ne: 'ready' };
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
    }

    const recs = await RecDb.asyncFind(query, [
      ['sort', { 'airing_details.datetime': -1 }]
    ]);

    const airingList = [];
    let description = '';
    const match = makeMatchDescription(steps);

    if (steps.length > 0) {
      description = 'matching: ';
    }

    if (!recs || recs.length === 0) {
      description = `No records found ${description}`;
      await this.setState({
        alert: { type: 'danger', text: description, match },
        view: 'search'
      });
    } else {
      sendResults({ loading: true });

      description = `${recs.length} recordings found ${description}`;

      this.setState({
        alert: {
          type: 'light',
          text: description,
          match
        },
        view: 'search'
      });

      await asyncForEach(recs, async doc => {
        const airing = await Airing.create(doc);
        airingList.push(airing);
      });
    }

    sendResults({ loading: false, view, airingList, actionList });
    this.setStateStore({ airingList });
  };

  render() {
    const {
      searchValue,
      stateFilter,
      typeFilter,
      watchedFilter,
      comskipFilter,
      showFilter,
      alert,
      actionList,
      view
    } = this.state;

    // console.log('SearchForm render', alert.text);

    let selectControl = (
      <Col md="2">
        <SelectedDisplay actionList={actionList} view={this.viewChange} />
      </Col>
    );
    if (view === 'selected') selectControl = '';

    return (
      <>
        <Row>
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

          <Col md="6">
            <ButtonGroup size="sm" className="mb-3 mr-0 pr-0">
              <InputGroup className="" size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text>state:</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  as="select"
                  value={stateFilter}
                  aria-describedby="btnState"
                  onChange={this.stateChange}
                >
                  <option>any</option>
                  <option>finished</option>
                  <option>failed</option>
                  <option>recording</option>
                </Form.Control>
              </InputGroup>

              <InputGroup className="" size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text>type:</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  as="select"
                  value={typeFilter}
                  aria-describedby="btnState"
                  onChange={this.typeChange}
                >
                  <option>any</option>
                  <option>episode</option>
                  <option>movie</option>
                  <option>sports</option>
                </Form.Control>
              </InputGroup>

              <InputGroup className="" size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text>watched:</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  as="select"
                  value={watchedFilter}
                  aria-describedby="btnState"
                  onChange={this.watchedChange}
                >
                  <option>all</option>
                  <option>yes</option>
                  <option>no</option>
                </Form.Control>
              </InputGroup>

              <InputGroup size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text>comskip:</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  as="select"
                  value={comskipFilter}
                  aria-describedby="btnState"
                  onChange={this.comskipChange}
                >
                  <option>all</option>
                  <option>ready</option>
                  <option>failed</option>
                </Form.Control>
              </InputGroup>

              <InputGroup className="" size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text>by show:</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  as="select"
                  value={showFilter}
                  aria-describedby="btnState"
                  onChange={this.showChange}
                >
                  <option>all</option>
                  {this.showsList.map(item => {
                    return (
                      <option
                        key={`show-filter-${item.object_id}`}
                        value={item.path}
                      >
                        {item.title}
                      </option>
                    );
                  })}
                </Form.Control>
              </InputGroup>
            </ButtonGroup>
          </Col>
        </Row>

        <Row>
          {selectControl}
          {view !== 'selected' ? (
            <Col className="pt-1" md="3">
              <Button variant="outline-info" size="xs" onClick={this.selectAll}>
                <span className="fa fa-plus pr-1" style={{ color: 'green' }} />
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
          ) : (
            ''
          )}

          {view === 'selected' ? (
            <>
              <Col className="pt-1">
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

        <Row>
          <Col>
            <Alert variant={alert.type}>
              {alert.text} <b>{alert.match}</b>
            </Alert>
          </Col>
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

function makeMatchDescription(steps) {
  if (!steps) return '';

  const parts = steps.map(item => {
    return item.text;
  });
  return parts.join(', ');
}

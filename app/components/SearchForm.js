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
import Airing from '../utils/Airing';
import { CHECKBOX_OFF } from './Checkbox';
import { showList } from './ShowsList';

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
  view: string,
  showFilter: string,
  alert: {
    type: string,
    text: string
  },
  airingList: Array<Airing>,
  actionList: {}
};

export default class SearchForm extends Component<Props, State> {
  props: Props;

  initialState: State;

  showsList: [];

  constructor() {
    super();

    this.initialState = {
      searchValue: '',
      typeFilter: 'any',
      stateFilter: 'any',
      watchedFilter: 'all',
      view: 'grid',
      showFilter: '',
      alert: { type: '', text: '' },
      airingList: [],
      actionList: {}
    };

    const storedState = JSON.parse(localStorage.getItem('SearchState') || '{}');
    delete storedState.recordingRefs;
    const initialStateCopy = { ...this.initialState };
    this.state = Object.assign(initialStateCopy, storedState);
    this.showsList = [];

    this.search = this.search.bind(this);
    this.stateChange = this.stateChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.watchedChange = this.watchedChange.bind(this);
    this.showChange = this.showChange.bind(this);
    this.viewChange = this.viewChange.bind(this);
    this.searchChange = this.searchChange.bind(this);
    this.searchKeyPressed = this.searchKeyPressed.bind(this);
    this.resetSearch = this.resetSearch.bind(this);
    this.addItem = this.addItem.bind(this);
    this.delItem = this.delItem.bind(this);
    this.emptyItems = this.emptyItems.bind(this);
    this.selectAll = this.selectAll.bind(this);
    this.unselectAll = this.unselectAll.bind(this);
  }

  async componentDidMount() {
    const { view, actionList } = this.state;
    this.showsList = await showList();
    const { length } = Object.keys(actionList);
    if (view === 'selected' && length >= 0) {
      this.setState({
        alert: { type: 'light', text: `${length} recordings found` }
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

    if (Object.keys(actionList).length === 0) return;

    const list = Object.keys(actionList).map(item => {
      return Object.assign(new Airing(), actionList[item]);
    });

    // descending
    const timeSort = (a, b) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    list.sort((a, b) => timeSort(a, b));

    this.setState({ view: 'selected' });

    await sendResults({ loading: true });
    sendResults({ loading: false, airingList: list, actionList });
  };

  addItem = (item: Airing) => {
    const { actionList } = this.state;
    if (!Object.keys(actionList).includes(item.object_id)) {
      actionList[item.object_id] = item;
      this.setState({ actionList });
    }
  };

  delItem = (item: Airing) => {
    const { actionList } = this.state;
    if (Object.keys(actionList).includes(item.object_id.toString())) {
      delete actionList[item.object_id];
      this.setState({ actionList });
    }
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
    const { airingList } = this.state;
    sendUnselectAll();
    airingList.forEach(airing => {
      this.delItem(airing);
    });
  };

  emptyItems = () => {
    const { toggleItem } = this.props;
    const { actionList } = this.state;
    Object.keys(actionList).forEach(id => {
      toggleItem(actionList[id], CHECKBOX_OFF);
    });
    this.setState({ actionList: {} });
  };

  delete = async () => {
    await this.search();
  };

  resetSearch = async () => {
    await this.setStateStore(this.initialState);
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
      showFilter
    } = this.state;

    const query = {};
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
    }

    if (stateFilter !== 'any') {
      query['video_details.state'] = stateFilter;
    }

    if (typeFilter !== 'any') {
      const typeRe = new RegExp(typeFilter, 'i');
      query.path = { $regex: typeRe };
    }

    if (watchedFilter !== 'all') {
      query['user_info.watched'] = watchedFilter === 'yes';
    }
    if (showFilter !== '' && showFilter !== 'all') {
      query.series_path = showFilter;
    }

    const recs = await RecDb.asyncFind(query, [
      ['sort', { 'airing_details.datetime': -1 }]
    ]);

    const airingList = [];
    if (!recs || recs.length === 0) {
      await this.setState({
        alert: { type: 'danger', text: 'No records found' }
      });
    } else {
      sendResults({ loading: true });
      this.setState({
        alert: { type: 'light', text: `${recs.length} recordings found` }
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
      showFilter,
      alert,
      actionList
    } = this.state;

    // console.log('SearchForm render');

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
          <Col md="2" className="">
            <SelectedDisplay actionList={actionList} view={this.viewChange} />
          </Col>
          <Col className="ml-0 pl-0 pt-1">
            <Button variant="outline-info" size="xs" onClick={this.selectAll}>
              <span className="fa fa-plus pr-1" style={{ color: 'green' }} />
              all
            </Button>
            &nbsp;
            <Button variant="outline-info" size="xs" onClick={this.unselectAll}>
              <span className="fa fa-minus pr-1" style={{ color: 'red' }} />
              all
            </Button>
            &nbsp;
            <Button
              variant="outline-danger"
              size="xs"
              onClick={this.emptyItems}
            >
              <span
                className="fa fa-times-circle pr-1"
                style={{ color: 'red' }}
              />
              empty
            </Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <Alert variant={alert.type}>{alert.text}</Alert>
          </Col>
        </Row>
      </>
    );
  }
}

function SelectedDisplay(prop) {
  const { actionList, view } = prop;

  const len = Object.keys(actionList).length;

  return (
    <Button onClick={view} variant="outline-primary" style={{ width: '100px' }}>
      <span className="fa fa-file-video" /> {len} selected
    </Button>
  );
}

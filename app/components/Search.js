// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';

import { RecDb } from '../utils/db';
import { asyncForEach } from '../utils/utils';
import Recording from './Recording';
import Airing from '../utils/Airing';

type Props = {};
type State = {
  searchValue: string,
  queryValue: string,
  typeFilter: string,
  stateFilter: string,
  watchedFilter: string,
  alertType: string,
  alertTxt: string,
  display: Array<Object>
};

export default class Search extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = {
      searchValue: '',
      queryValue: '',
      typeFilter: 'any',
      stateFilter: 'any',
      watchedFilter: 'all',
      alertType: '',
      alertTxt: '',
      display: []
    };

    const storedState = JSON.parse(localStorage.getItem('SearchState') || '{}');

    this.state = Object.assign(this.initialState, storedState);

    this.search = this.search.bind(this);
    this.stateChange = this.stateChange.bind(this);
    this.typeChange = this.typeChange.bind(this);
    this.watchedChange = this.watchedChange.bind(this);
    this.searchChange = this.searchChange.bind(this);
    this.searchKeyPressed = this.searchKeyPressed.bind(this);
    this.queryChange = this.queryChange.bind(this);
    this.queryKeyPressed = this.queryKeyPressed.bind(this);
    this.resetSearch = this.resetSearch.bind(this);
  }

  async componentDidMount() {
    await this.search();
  }

  delete = async () => {
    await this.search();
  };

  resetSearch = async () => {
    await this.setStateStore(this.initialState);
    this.search();
  };

  async setStateStore(...args: Array<Object>) {
    const values = args[0];
    await this.setState(values);
    const cleanState = this.state;
    cleanState.display = [];
    localStorage.setItem('SearchState', JSON.stringify(cleanState));
  }

  stateChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setStateStore({ stateFilter: event.currentTarget.value });
    this.search();
  };

  typeChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setStateStore({ typeFilter: event.currentTarget.value });
    this.search();
  };

  watchedChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setStateStore({ watchedFilter: event.currentTarget.value });
    this.search();
  };

  searchChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    if (!event.currentTarget.value) return;
    this.setStateStore({ searchValue: event.currentTarget.value });
  };

  searchKeyPressed = async (
    event: SyntheticKeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      await this.search();
    }
  };

  queryChange = async (event: SyntheticEvent<HTMLInputElement>) => {
    this.setStateStore({ queryValue: event.currentTarget.value });
  };

  queryKeyPressed = async (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      this.search();
    }
  };

  search = async () => {
    const {
      searchValue,
      queryValue,
      stateFilter,
      typeFilter,
      watchedFilter
    } = this.state;

    const result = [];

    let query = {};
    if (queryValue) {
      // eslint-disable-next-line no-eval
      query = eval(queryValue);
    } else {
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
    }
    // console.log('Query', query);

    const recs = await RecDb.asyncFind(query, [
      ['sort', { 'airing_details.datetime': -1 }]
    ]);

    if (!recs || recs.length === 0) {
      await this.setState({
        alertType: 'danger',
        alertTxt: 'No records found'
      });
    } else {
      this.setState({
        display: [
          <Container key="spinner">
            <Row className="pl-lg-5">
              <Spinner animation="grow" variant="info" />
            </Row>
          </Container>
        ]
      });

      await this.setState({
        alertType: 'info',
        alertTxt: `${recs.length} recordings found`
      });
      await asyncForEach(recs, async doc => {
        const airing = await Airing.create(doc);
        result.push(
          <Recording
            search={this.search}
            doDelete={this.search}
            key={airing.object_id}
            airing={airing}
          />
        );
      });
    }
    await this.setState({ display: result });
  };

  render() {
    const {
      searchValue,
      queryValue,
      stateFilter,
      typeFilter,
      watchedFilter,
      alertType,
      alertTxt,
      display
    } = this.state;

    return (
      <>
        <Row>
          <Col>
            <Form>
              <InputGroup size="sm" className="d-inline">
                <Button
                  className="mb-3 mr-3"
                  size="sm"
                  variant="outline-dark"
                  onClick={this.resetSearch}
                >
                  reset
                </Button>
              </InputGroup>

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
              </ButtonGroup>

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

              <InputGroup
                className="mb-3"
                size="sm"
                value={queryValue}
                onKeyPress={this.queryKeyPressed}
                onChange={this.queryChange}
              >
                <FormControl
                  placeholder="Enter query..."
                  aria-label="Enter query..."
                  value={queryValue}
                  onChange={this.queryChange}
                />

                <InputGroup.Append>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={this.search}
                  >
                    Query!
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
            <Alert variant={alertType}>{alertTxt}</Alert>
          </Col>
        </Row>
        <Row className="m-1 mb-4">{display}</Row>
      </>
    );
  }
}

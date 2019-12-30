// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import Search from './Search';
import Incomplete from './Incomplete';
import Shows from './Shows';

type Props = {};
type State = { view: number };

const VIEW_SEARCH = 1;
const VIEW_INCOMPLETE = 2;
const VIEW_SHOWS = 3;

export default class Browse extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = { view: VIEW_SEARCH };
    const storedState = JSON.parse(localStorage.getItem('BrowseState') || '');

    this.state = Object.assign(this.initialState, storedState);

    this.viewSearch = this.viewSearch.bind(this);
    this.viewIncomplete = this.viewIncomplete.bind(this);
    this.viewShows = this.viewShows.bind(this);
  }

  async componentDidMount() {
    // await this.search();
  }

  async setStateStore(...args: Array<Object>) {
    const values = args[0];
    await this.setState(values);
    const cleanState = this.state;
    localStorage.setItem('BrowseState', JSON.stringify(cleanState));
  }

  viewSearch = async () => {
    await this.setStateStore({ view: VIEW_SEARCH });
  };

  viewIncomplete = async () => {
    await this.setStateStore({ view: VIEW_INCOMPLETE });
  };

  viewShows = async () => {
    await this.setStateStore({ view: VIEW_SHOWS });
  };

  render() {
    const { view } = this.state;
    const baseClass = 'h3';
    let incBtnClass = baseClass;
    let searchBtnClass = baseClass;
    let showBtnClass = baseClass;

    switch (view) {
      case VIEW_INCOMPLETE:
        incBtnClass += ' active  ';
        break;
      case VIEW_SHOWS:
        showBtnClass += ' active  ';
        break;
      case VIEW_SEARCH:
      default:
        searchBtnClass += ' active';
    }
    return (
      <>
        <Row>
          <Col>
            <ButtonGroup>
              <Button as="h3" size="lg" variant="secondary" className="h3">
                Browse Recordings:
              </Button>
              <Button
                className={`h3 ${searchBtnClass}`}
                size="sm"
                variant="primary"
                onClick={this.viewSearch}
              >
                Search
              </Button>

              <Button
                className={`h3 ${incBtnClass}`}
                size="sm"
                variant="primary"
                onClick={this.viewIncomplete}
              >
                incomplete
              </Button>

              <Button
                className={`h3 ${showBtnClass}`}
                size="sm"
                variant="primary"
                onClick={this.viewShows}
              >
                Shows
              </Button>
            </ButtonGroup>
          </Col>
        </Row>

        {view === VIEW_SEARCH ? <Search /> : ''}
        {view === VIEW_INCOMPLETE ? <Incomplete /> : ''}
        {view === VIEW_SHOWS ? <Shows /> : ''}
      </>
    );
  }
}

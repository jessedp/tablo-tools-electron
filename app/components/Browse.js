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

const VIEW_SEARCH = 1;
const VIEW_INCOMPLETE = 2;
const VIEW_SHOWS = 3;
export default class Browse extends Component<Props> {
  props: Props;

  constructor() {
    super();

    this.initialState = { view: VIEW_SEARCH };
    const storedState = JSON.parse(localStorage.getItem('BrowseState'));

    this.state = storedState || this.initialState;

    this.viewSearch = this.viewSearch.bind(this);
    this.viewIncomplete = this.viewIncomplete.bind(this);
    this.viewShows = this.viewShows.bind(this);
  }

  async componentDidMount() {
    // await this.search();
  }

  async setStateStore(...args) {
    const values = args[0];
    await this.setState(values);
    const cleanState = this.state;
    delete cleanState.display;
    localStorage.setItem('BrowseState', JSON.stringify(cleanState));
  }

  async viewSearch() {
    await this.setStateStore({ view: VIEW_SEARCH });
  }

  async viewIncomplete() {
    await this.setStateStore({ view: VIEW_INCOMPLETE });
  }

  async viewShows() {
    await this.setStateStore({ view: VIEW_SHOWS });
  }

  render() {
    const { view } = this.state;
    let { incBtnClass, searchBtnClass, showBtnClass } = 'h3';
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

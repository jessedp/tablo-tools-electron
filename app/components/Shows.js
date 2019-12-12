// @flow
import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';

import ShowsList from './ShowsList';
import EpisodeList from './EpisodeList';
import Show from '../utils/Show';

type Props = {};

const VIEW_SHOWS = 1;
const VIEW_EPISODES = 2;

export default class Shows extends Component<Props> {
  props: Props;

  constructor() {
    super();

    this.initialState = { view: VIEW_SHOWS, show: null };

    const storedState = JSON.parse(localStorage.getItem('ShowsState'));
    if (storedState.show) {
      storedState.show = new Show(storedState.show);
    }

    this.state = storedState || this.initialState;
    this.viewShows = this.viewShows.bind(this);
    this.viewEpisodes = this.viewEpisodes.bind(this);
  }

  async setStateStore(...args) {
    const values = args[0];
    await this.setState(values);
    const cleanState = this.state;
    delete cleanState.display;
    localStorage.setItem('ShowsState', JSON.stringify(cleanState));
  }

  viewShows() {
    this.setStateStore({ view: VIEW_SHOWS, show: null });
  }

  async viewEpisodes(show) {
    await this.setStateStore({ view: VIEW_EPISODES, show });
  }

  render() {
    const { view, show } = this.state;

    if (view === VIEW_EPISODES) {
      return (
        <>
          <Button
            onClick={this.viewShows}
            variant="outline-dark"
            className="mb-3"
          >
            <i className="fa fa-arrow-left" />
            <span className="pl-1">Back to Shows</span>
          </Button>
          <EpisodeList show={show} />
        </>
      );
    }

    return <ShowsList viewEpisodes={this.viewEpisodes} />;
  }
}

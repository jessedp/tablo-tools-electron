// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import Button from 'react-bootstrap/Button';

import ShowsList from './ShowsList';
import EpisodeList from './EpisodeList';
import Show from '../utils/Show';

type Props = {};
type State = {
  view: number,
  show: Show
};

const VIEW_SHOWS = 1;
const VIEW_EPISODES = 2;

export default class Shows extends Component<Props, State> {
  props: Props;

  initialState: State;

  psToken: null;

  constructor() {
    super();

    this.initialState = { view: VIEW_SHOWS, show: new Show() };

    const storedState = JSON.parse(localStorage.getItem('ShowsState') || '{}');
    if (storedState.show) {
      storedState.show = new Show(storedState.show);
    }

    this.state = Object.assign(this.initialState, storedState);
    this.viewShows = this.viewShows.bind(this);
    this.viewEpisodes = this.viewEpisodes.bind(this);
  }

  componentDidMount() {
    this.psToken = PubSub.subscribe('DB_CHANGE', () => {
      this.viewShows();
    });
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  async setStateStore(...args: Array<Object>) {
    const values = args[0];
    await this.setState(values);
    const cleanState = this.state;
    localStorage.setItem('ShowsState', JSON.stringify(cleanState));
  }

  viewShows = async () => {
    await this.setStateStore({ view: VIEW_SHOWS, show: null });
  };

  viewEpisodes = async (show: Show) => {
    await this.setStateStore({ view: VIEW_EPISODES, show });
  };

  render() {
    const { view, show } = this.state;

    if (view === VIEW_EPISODES) {
      return (
        <div className="section">
          <div>
            <Button
              onClick={this.viewShows}
              variant="outline-dark"
              className="mb-3"
            >
              <i className="fa fa-arrow-left" />
              <span className="pl-1">Back to Shows</span>
            </Button>
          </div>
          <EpisodeList show={show} />
        </div>
      );
    }

    return <ShowsList viewEpisodes={this.viewEpisodes} />;
  }
}

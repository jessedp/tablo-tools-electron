// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';

import { LinkContainer } from 'react-router-bootstrap';
import { Alert, Button } from 'react-bootstrap';

import routes from '../constants/routes.json';

import Airing from '../utils/Airing';
import { asyncForEach } from '../utils/utils';
import ShowCover from './ShowCover';

type Props = {};
type State = { movies: Array<Airing>, alertType: string, alertTxt: string };

export default class Movies extends Component<Props, State> {
  props: Props;

  initialState: State;

  psToken: null;

  constructor() {
    super();

    this.state = { movies: [], alertType: '', alertTxt: '' };

    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  refresh = async () => {
    const objRecs = await movieList();
    const label = objRecs.length === 1 ? 'movie' : 'movies';
    this.setState({
      movies: objRecs,
      alertType: 'info',
      alertTxt: `${objRecs.length} ${label} found`
    });
  };

  render() {
    const { movies, alertTxt, alertType } = this.state;

    if (movies.length === 0) {
      return (
        <Alert variant="danger" className="full-alert p-3 mt-3">
          <span className="fa fa-exclamation mr-2" />
          No Movies found.
        </Alert>
      );
    }

    return (
      <div className="section">
        <div>
          {alertTxt ? (
            <Alert className="fade m-2" variant={alertType}>
              {alertTxt}
            </Alert>
          ) : (
            ''
          )}
        </div>
        <div className="scrollable-area">
          {movies.map(rec => {
            return (
              <LinkContainer
                to={routes.MOVIEDETAILS.replace(':id', rec.id)}
                key={rec.id}
              >
                <Button
                  variant="light"
                  className="align-content-center"
                  key={rec.id}
                >
                  <ShowCover show={rec.show} key={`movie-${rec.id}`} />;
                </Button>
              </LinkContainer>
            );
          })}
        </div>
      </div>
    );
  }
}

export async function movieList() {
  const recType = new RegExp('movie');
  const recs = await global.RecDb.asyncFind({ path: { $regex: recType } });

  const objRecs = [];

  await asyncForEach(recs, async rec => {
    const airing = await Airing.create(rec);
    objRecs.push(airing);
  });

  const titleSort = (a, b) => {
    if (a.show.sortableTitle > b.show.sortableTitle) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));

  return objRecs;
}

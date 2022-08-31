import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import { LinkContainer } from 'react-router-bootstrap';
import { Alert, Button } from 'react-bootstrap';
import routes from '../constants/routes.json';
import Airing from '../utils/Airing';
import ShowCover from './ShowCover';
import { movieList } from '../utils/dbHelpers';

type Props = Record<string, never>;

type State = {
  movies: Array<Airing>;
  alertType: string;
  alertTxt: string;
  loaded: boolean;
};
export default class Movies extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      movies: [],
      alertType: '',
      alertTxt: '',
      loaded: false,
    };
    this.psToken = '';
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  refresh = async () => {
    const objRecs = await movieList();
    const label = objRecs.length === 1 ? 'movie' : 'movies';
    this.setState({
      movies: objRecs,
      alertType: 'info',
      alertTxt: `${objRecs.length} ${label} found`,
      loaded: true,
    });
  };

  render() {
    const { movies, loaded, alertTxt, alertType } = this.state;
    if (!loaded) return <></>; //

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
          {movies.map((rec) => {
            return (
              <LinkContainer
                to={routes.MOVIEDETAILS.replace(':id', rec.id.toString())}
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

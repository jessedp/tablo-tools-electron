// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import { LinkContainer } from 'react-router-bootstrap';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import routes from '../constants/routes.json';

import Show from '../utils/Show';
import ShowCover from './ShowCover';
import { asyncForEach } from '../utils/utils';

type Props = {};
type State = {
  shows: Array<Show>,
  alertType: string,
  alertTxt: string
};

export default class Shows extends Component<Props, State> {
  props: Props;

  initialState: State;

  psToken: null;

  constructor() {
    super();

    this.initialState = { shows: [], alertType: '', alertTxt: '' };

    this.state = this.initialState;

    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  refresh = async () => {
    const objRecs = await showList();
    this.setState({
      shows: objRecs,
      alertType: 'info',
      alertTxt: `${objRecs.length} shows found`
    });
  };

  render() {
    const { alertType, alertTxt, shows } = this.state;

    if (shows.length === 0) {
      return (
        <Container key="spinner">
          <Row className="pl-lg-5">
            <Spinner animation="grow" variant="info" />
          </Row>
        </Container>
      );
    }

    return (
      <div className="section">
        <div>
          <Alert variant={alertType}>{alertTxt}</Alert>
        </div>
        <div className="scrollable-area">
          {shows.map(show => {
            if (show.series) {
              return (
                <LinkContainer
                  to={routes.EPISODES.replace(':id', show.id)}
                  key={show.id}
                >
                  <Button
                    variant="light"
                    className="cover align-content-center d-inline-block"
                  >
                    <ShowCover key={show.id} show={show} />
                  </Button>
                </LinkContainer>
              );
            }
            return (
              <Button
                onClick={() => {}}
                onKeyDown={() => {}}
                variant="light"
                className="align-content-center"
                key={show.id}
              >
                <ShowCover key={show.id} show={show} />
              </Button>
            );
          })}
        </div>
      </div>
    );
  }
}

export async function showList() {
  const recType = new RegExp('series');
  const recs = await global.ShowDb.asyncFind({ path: { $regex: recType } });

  const objRecs = [];

  await asyncForEach(recs, async rec => {
    const show = new Show(rec);
    objRecs.push(show);
  });

  const titleSort = (a, b) => {
    if (a.sortableTitle > b.sortableTitle) return 1;
    return -1;
  };

  objRecs.sort((a, b) => titleSort(a, b));

  return objRecs;
}

// @flow
import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import Show from '../utils/Show';
import ShowCover from './ShowCover';
import { asyncForEach } from '../utils/utils';

type Props = { viewEpisodes: (show: Show) => {} };
type State = {
  display: Array<Object>,
  alertType: string,
  alertTxt: string
};

export default class ShowsList extends Component<Props, State> {
  props: Props;

  initialState: State;

  psToken: null;

  constructor() {
    super();

    this.initialState = { display: [], alertType: '', alertTxt: '' };

    this.state = this.initialState;

    this.search = this.search.bind(this);
  }

  async componentDidMount() {
    await this.search();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.search);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
  }

  search = async () => {
    const { viewEpisodes } = this.props;

    const objRecs = await showList();
    const result = [];

    if (!objRecs || objRecs.length === 0) {
      this.setState({ alertType: 'warning', alertTxt: 'No shows found' });
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

      this.setState({
        alertType: 'info',
        alertTxt: `${objRecs.length} shows found`
      });

      objRecs.forEach(show => {
        if (show.series) {
          result.push(
            <Button
              onClick={() => viewEpisodes(show)}
              onKeyDown={() => viewEpisodes(show)}
              variant="light"
              className="align-content-center"
              key={show.id}
            >
              <ShowCover key={show.id} show={show} />
            </Button>
          );
        } else {
          result.push(
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
        }
      });
    }
    await this.setState({ display: result });
  };

  render() {
    const { alertType, alertTxt, display } = this.state;

    return (
      <div className="section">
        <div>
          {display ? <Alert variant={alertType}>{alertTxt}</Alert> : ''}
        </div>
        <div className="scrollable-area">{display}</div>
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

// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import { ShowDb } from '../utils/db';

import Show from '../utils/Show';
import ShowCover from './ShowCover';

type Props = { viewEpisodes: (show: Show) => {} };
type State = {
  display: Array<Object>,
  alertType: string,
  alertTxt: string
};

export default class ShowsList extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();

    this.initialState = { display: [], alertType: '', alertTxt: '' };

    this.state = this.initialState;

    this.search = this.search.bind(this);
  }

  async componentDidMount() {
    await this.search();
  }

  search = async () => {
    const { viewEpisodes } = this.props;
    const query = {};

    const recs = await ShowDb.asyncFind(query);

    const objRecs = [];

    recs.forEach(rec => {
      const show = new Show(rec);
      objRecs.push(show);
    });

    const titleSort = (a, b) => {
      if (a.sortableTitle > b.sortableTitle) return 1;
      return -1;
    };

    objRecs.sort((a, b) => titleSort(a, b));

    const result = [];

    if (!objRecs || objRecs.length === 0) {
      await this.setState({ alertType: 'danger', alertTxt: 'No shows found' });
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
        alertTxt: `${objRecs.length} shows found`
      });

      objRecs.forEach(show => {
        // console.log(show);
        if (show.series) {
          result.push(
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <Button
              onClick={() => viewEpisodes(show)}
              variant="light"
              className="align-content-center"
              key={show.id}
            >
              <ShowCover key={show.id} show={show} />
            </Button>
          );
        } else {
          result.push(
            <div className="align-content-center p-2 m-2" key={show.id}>
              <ShowCover key={show.id} show={show} />
            </div>
          );
        }
      });
    }
    await this.setState({ display: result });
  };

  render() {
    const { alertType, alertTxt, display } = this.state;

    return (
      <>
        <Row>
          <Col>
            {display ? <Alert variant={alertType}>{alertTxt}</Alert> : ''}
          </Col>
        </Row>
        <Row className="m-1 mb-4">{display}</Row>
      </>
    );
  }
}

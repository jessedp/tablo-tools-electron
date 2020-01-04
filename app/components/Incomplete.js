// @flow
import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

import { RecDb } from '../utils/db';
import { asyncForEach } from '../utils/utils';
import Recording from './Recording';
import Airing from '../utils/Airing';

type Props = {};
type State = {
  percent: number,
  alertType: string,
  alertTxt: string,
  display: Object,
  percentLoc: number
};

export default class Incomplete extends Component<Props, State> {
  props: Props;

  initialState: State;

  constructor() {
    super();
    this.percentDragTimeout = null;
    this.percentDragSearchTimeout = null;

    this.initialState = {
      percent: 90,
      alertType: '',
      alertTxt: '',
      display: '',
      percentLoc: 0
    };

    const storedState = JSON.parse(
      localStorage.getItem('IncompleteState') || '{}'
    );

    this.state = Object.assign(this.initialState, storedState);

    this.search = this.search.bind(this);
    this.percentDrag = this.percentDrag.bind(this);
  }

  async componentDidMount() {
    await this.search();
  }

  percentDragTimeout: ?TimeoutID = null;

  percentDragSearchTimeout: ?TimeoutID = null;

  async setStateStore(...args: Array<Object>) {
    const values = args[0];
    await this.setState(values);
    const cleanState = this.state;
    delete cleanState.display;
    localStorage.setItem('IncompleteState', JSON.stringify(cleanState));
  }

  percentDrag = (event: SyntheticDragEvent<HTMLInputElement>) => {
    if (!event) return;

    this.setStateStore({ percent: event.currentTarget.value });

    const slider = event.currentTarget;

    if (this.percentDragSearchTimeout) {
      clearTimeout(this.percentDragSearchTimeout);
    }

    if (this.percentDragTimeout) {
      clearTimeout(this.percentDragTimeout);
    }
    const sliderPos = parseInt(slider.value, 10) / parseInt(slider.max, 10);

    // blah, figure out the math of this :/
    let xShim = 0;
    if (sliderPos < 0.25) {
      xShim = 7;
    } else if (sliderPos < 0.5) {
      xShim = 2;
    } else if (sliderPos < 0.66) {
      xShim = 0;
    } else if (sliderPos < 0.85) {
      xShim = -2;
    } else {
      xShim = -4;
    }

    const xPos = Math.round(slider.clientWidth * sliderPos) + xShim;

    this.percentDragTimeout = setTimeout(async () => {
      if (xPos) await this.setStateStore({ percentLoc: xPos });
    }, 10);

    this.percentDragSearchTimeout = setTimeout(async () => {
      this.search();
    }, 1000);
  };

  search = async () => {
    const { percent } = this.state;
    const pct = percent / 100;

    const query = {};
    const typeRe = new RegExp('episode', 'i');
    query.path = { $regex: typeRe };

    let recs = await RecDb.asyncFind(query, [
      ['sort', { 'airing_details.datetime': -1 }],
      ['limit', -1]
    ]);

    recs = recs.filter(
      rec => rec.airing_details.duration * pct > rec.video_details.duration
    );

    const result = [];

    if (!recs || recs.length === 0) {
      await this.setState({
        alertType: 'danger',
        alertTxt: 'No records found'
      });
    } else {
      this.setState({
        display: (
          <Container>
            <Row className="pl-lg-5">
              <Spinner animation="grow" variant="info" />
            </Row>
          </Container>
        )
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
            doDelete={() => {}}
            key={airing.object_id}
            airing={airing}
          />
        );
      });
    }
    await this.setState({ display: result });
  };

  render() {
    const { percent, alertType, alertTxt, display } = this.state;
    let { percentLoc } = this.state;
    const pctLabel = `${percent}%`;

    if (!percentLoc) percentLoc = 0;

    return (
      <>
        <Row>
          <Col md="1">&nbsp;</Col>
          <Col md="10">
            <label
              className="justify-content-center mb-3"
              style={{ width: '95%' }}
              id="pctLabel"
              htmlFor="customRange"
            >
              Percent Incomplete
              <Button
                className="ml-4"
                size="sm"
                variant="outline-secondary"
                onClick={this.search}
              >
                Refine
              </Button>
              <input
                type="range"
                name="customRange"
                className="custom-range"
                id="customRange"
                min="0"
                max="100"
                step="1"
                value={percent}
                title={pctLabel}
                onChange={this.percentDrag}
              />
            </label>
            <span
              className="pl-1 pr-1"
              style={{
                borderStyle: 'solid',
                borderWidth: '1px',
                borderRadius: '5px',
                position: 'absolute',
                top: 52,
                left: percentLoc,
                background: 'white',
                zIndex: '10000'
              }}
            >
              {' '}
              {percent}%{' '}
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            {display ? <Alert variant={alertType}>{alertTxt}</Alert> : ''}
          </Col>
        </Row>
        <Row className="m-1 mb-4 justify-content-center">{display}</Row>
      </>
    );
  }
}

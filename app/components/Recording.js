// @flow

import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import Title from './Title';
import TabloImage from './TabloImage';
import RecordingOverview from './RecordingOverview';
import ConfirmDelete from './ConfirmDelete';
import TabloVideoPlayer from './TabloVideoPlayer';
import AiringStatus from './AiringStatus';
import Checkbox, { CHECKBOX_OFF } from './Checkbox';

import styles from './Recording.css';
import VideoExport from './VideoExport';
import Airing from '../utils/Airing';

type Props = {
  doDelete: () => ?Promise<any>,
  addItem: (item: Airing) => void,
  delItem: (item: Airing) => void,
  airing: Airing,
  checked?: number
};
type State = { recOverviewOpen: boolean };

export default class Recording extends Component<Props, State> {
  props: Props;

  static defaultProps: {};

  // for 2 way interaction you're not supposed to do
  checkboxRef: Checkbox;

  constructor(props: Props) {
    super();
    this.state = { recOverviewOpen: false };
    this.props = props;

    this.checkboxRef = React.createRef();

    (this: any).toggleSelection = this.toggleSelection.bind(this);
    (this: any).toggleRecOverview = this.toggleRecOverview.bind(this);
    (this: any).deleteAiring = this.deleteAiring.bind(this);
    (this: any).processVideo = this.processVideo.bind(this);
  }

  toggleSelection() {
    const { airing, addItem, delItem } = this.props;

    // FIXME: gross, don't know if this is correct way to do this
    if (
      this.checkboxRef === null ||
      !Object.prototype.hasOwnProperty.call(this.checkboxRef, 'state')
    )
      return;

    const { state } = this.checkboxRef;
    const { checked } = state;

    // we get this value before it's set, so the test is backwards
    if (!checked) {
      addItem(airing);
    } else {
      delItem(airing);
    }
  }

  toggleRecOverview() {
    const { recOverviewOpen } = this.state;
    this.setState({
      recOverviewOpen: !recOverviewOpen
    });
  }

  async processVideo() {
    const { airing } = this.props;
    await airing.processVideo();
  }

  async deleteAiring() {
    const { airing, doDelete } = this.props;
    await airing.delete();
    doDelete();
  }

  render() {
    const { airing, checked } = this.props;
    const { recOverviewOpen } = this.state;
    const classes = `m-1 pt-1 pb-1 border  ${styles.box}`;

    return (
      <Container className={classes}>
        <Row>
          <Col md="3">
            <TabloImage imageId={airing.thumbnail} />
          </Col>
          <Col md="8">
            <Title airing={airing} />
          </Col>
          <Col md="1">
            <Checkbox
              checked={checked}
              ref={checkboxRef => (this.checkboxRef = checkboxRef)}
              handleChange={this.toggleSelection}
            />
          </Col>
        </Row>
        <Row>
          <Col md="auto">
            <span className="smaller">
              <b>Duration: </b>
              {airing.actualDuration} of {airing.duration}
              <br />
            </span>
          </Col>
          <Col>
            <AiringStatus airing={airing} />
          </Col>
        </Row>
        <Row>
          <Col md="auto">
            {recOverviewOpen ? (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={this.toggleRecOverview}
              >
                Recording details
                <span className="pl-2 fa fa-arrow-up" />
              </Button>
            ) : (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={this.toggleRecOverview}
              >
                Recording details
                <span className="pl-2 fa fa-arrow-down" />
              </Button>
            )}
          </Col>
          <Col md="auto">
            <TabloVideoPlayer airing={airing} />
          </Col>
          <Col md="auto">
            <VideoExport airing={airing} />
          </Col>
          <Col md="auto">
            <ConfirmDelete what={[airing]} onDelete={this.deleteAiring} />
          </Col>
        </Row>
        <Row>
          <Col>
            {recOverviewOpen ? <RecordingOverview airing={airing} /> : ''}
          </Col>
        </Row>
      </Container>
    );
  }
}
Recording.defaultProps = {
  checked: CHECKBOX_OFF
};

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

  // for 2 way interaction you're maybe not supposed to do for this reason
  // TODO: figure out the type.
  checkboxRef: any;

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

    if (!this.checkboxRef) return;
    const { state } = this.checkboxRef;
    if (!state) return;
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
    const classes = `m-1 pt-1 search-box`;

    let overviewClass = 'pl-2 fa ';
    if (recOverviewOpen) {
      overviewClass = `${overviewClass} fa-arrow-up`;
    } else {
      overviewClass = `${overviewClass} fa-arrow-down`;
    }

    let checkbox = '';
    if (airing.videoDetails.state !== 'recording') {
      checkbox = (
        <Col md="1" className="mr-0 pr-1">
          <div className="float-right p-0 m-0">
            <Checkbox
              checked={checked}
              ref={checkboxRef => (this.checkboxRef = checkboxRef)}
              handleChange={this.toggleSelection}
            />
          </div>
        </Col>
      );
    }
    return (
      <Container className={classes}>
        <Row>
          <Col md="3" className="ml-0 mr-0 pl-0 pr-0">
            <TabloImage imageId={airing.thumbnail} className="search-image" />
          </Col>
          <Col md="9" style={{ display: 'flex', flexDirection: 'column' }}>
            <Row>
              <Col md="11" className="ml-0 mr-0 pl-0 pr-0">
                <Title airing={airing} />
              </Col>
              {checkbox}
            </Row>

            <div style={{ flex: 1 }} />

            <Row>
              <Col md="auto" className="ml-0 mr-0 pl-0 pr-0">
                <span className="smaller">
                  <b>Duration: </b>
                  {airing.actualDuration} of {airing.duration}
                  <br />
                </span>
              </Col>
            </Row>

            <Row className="pb-1">
              <Col md="7" className="ml-0 pl-0 mr-0 pr-0">
                <Button
                  variant="outline-secondary"
                  size="xs"
                  onClick={this.toggleRecOverview}
                >
                  details
                  <span className={overviewClass} />
                </Button>
                &nbsp;
                <TabloVideoPlayer airing={airing} />
                &nbsp;
                <VideoExport airingList={[airing]} />
                &nbsp;
                <ConfirmDelete
                  airingList={[airing]}
                  onDelete={this.deleteAiring}
                />
              </Col>
              <Col md="5" className="ml-0 pl-0 mr-0 pr-0">
                <div className="float-right">
                  <AiringStatus airing={airing} />
                </div>
              </Col>
            </Row>
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

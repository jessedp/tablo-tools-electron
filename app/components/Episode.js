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

import styles from './Episode.css';
import VideoExport from './VideoExport';

type Props = { doDelete: () => {}, airing: null };

export default class Episode extends Component<Props> {
  props: Props;

  constructor(props) {
    super();
    this.state = { recOverviewOpen: false };
    this.props = props;

    this.toggleRecOverview = this.toggleRecOverview.bind(this);
    this.deleteAiring = this.deleteAiring.bind(this);
    this.processVideo = this.processVideo.bind(this);
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
    const { airing } = this.props;
    const { recOverviewOpen } = this.state;
    // console.log(airing);
    // console.log(airing.cachedWatch );
    const classes = `border m-1 p-1 ${styles.box}`;

    return (
      <Container className={classes}>
        <Row>
          <Col md="3">
            <TabloImage imageId={airing.thumbnail} />
          </Col>
          <Col md="9">
            <Title airing={airing} />
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

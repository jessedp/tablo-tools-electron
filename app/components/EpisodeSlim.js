// @flow

import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import TitleSlim from './TitleSlim';
import AiringStatus from './AiringStatus';

type Props = { doDelete: () => {}, airing: null };

export default class EpisodeSlim extends Component<Props> {
  props: Props;

  constructor(props) {
    super();
    this.state = {};
    this.props = props;

    this.deleteAiring = this.deleteAiring.bind(this);
  }

  async deleteAiring() {
    const { airing, doDelete } = this.props;
    await airing.delete();
    doDelete();
  }

  render() {
    const { airing } = this.props;

    const classes = `border m-1 p-1 `;

    return (
      <Container className={classes}>
        <Row>
          <Col md="7">
            <TitleSlim airing={airing} />
          </Col>
          <Col md="2">
            <AiringStatus airing={airing} />
          </Col>
          <Col>
            <span className="smaller">
              <b>Duration: </b>
              {airing.actualDuration} of {airing.duration}
              <br />
            </span>
          </Col>
        </Row>
      </Container>
    );
  }
}

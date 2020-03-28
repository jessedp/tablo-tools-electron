// @flow
import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

import TitleSlim, { viewEnum } from './TitleSlim';
import AiringStatus from './AiringStatus';
import Airing from '../utils/Airing';

type Props = {
  doDelete: () => void,
  airing: Airing,
  view?: viewEnum
};

export default class EpisodeSlim extends Component<Props> {
  props: Props;

  static defaultProps: {};

  constructor(props: Props) {
    super();
    this.props = props;

    this.deleteAiring = this.deleteAiring.bind(this);
  }

  deleteAiring = async () => {
    const { airing, doDelete } = this.props;
    await airing.delete();
    doDelete();
  };

  render() {
    const { airing, view } = this.props;

    const classes = `border pb-1 mb-2 pt-1`;

    return (
      <Container className={classes}>
        <Row>
          <Col md="8">
            <TitleSlim airing={airing} view={view} />
          </Col>
          <Col md="4">
            <Row>
              <Col md="6">
                <div className="float-right">
                  <AiringStatus airing={airing} />
                </div>
              </Col>
              <Col md="6">
                <span className="smaller float-right">
                  <span className="fa fa-clock pr-1" />
                  {airing.actualDuration} / {airing.duration}
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}
EpisodeSlim.defaultProps = { view: 'episode' };

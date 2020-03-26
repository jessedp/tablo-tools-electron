import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Description from './Description';

type Props = { airing: null };

export default class TitleSlim extends Component<Props> {
  props: Props;

  render() {
    const { airing } = this.props;

    return (
      <Row style={{ fontSize: 'small' }}>
        <Col md="1">
          <Badge pill className="p-1" variant="dark">
            Ep. {airing.episode.number}
          </Badge>
        </Col>
        <Col md="4">
          <span className="pl-2 smaller">{airing.datetime}</span>
        </Col>
        <Col md="7">
          <div className="">
            {airing.title ? (
              <span className="pl-3">
                <b>{airing.title}</b>
              </span>
            ) : (
              ''
            )}

            <Description description={airing.description} />
          </div>
        </Col>
      </Row>
    );
  }
}

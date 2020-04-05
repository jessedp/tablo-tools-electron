// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Description from './Description';
import Airing from '../utils/Airing';

type Props = { airing: Airing, withShow?: number };

export default class TitleSlim extends Component<Props> {
  props: Props;

  static defaultProps = { withShow: 0 };

  render() {
    const { airing, withShow } = this.props;

    let episodeContent = '';
    if (airing.isEpisode) {
      episodeContent = (
        <Badge pill className="p-1" variant="dark">
          Ep. {airing.episode.number}
        </Badge>
      );
    }

    let showBlock = '';
    if (withShow === 1) {
      showBlock = <div className="text-primary">{airing.showTitle}</div>;
    }

    return (
      <Row style={{ fontSize: 'small' }}>
        <Col md="1">{episodeContent}</Col>
        <Col md="3" className="pr-0">
          <span className="smaller">{airing.datetime}</span>
        </Col>
        <Col md="8">
          {showBlock}
          <Title title={airing.title} />
          <Description description={airing.description} />
        </Col>
      </Row>
    );
  }
}

function Title(prop) {
  const { title } = prop;
  if (!title) return <></>;

  return <b>{title}</b>;
}

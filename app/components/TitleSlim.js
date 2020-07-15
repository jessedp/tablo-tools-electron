// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Description from './Description';
import Airing from '../utils/Airing';
import { SERIES, ON, OFF } from '../constants/app';

type Props = { airing: Airing, withShow?: number };

export default class TitleSlim extends Component<Props> {
  props: Props;

  static defaultProps = { withShow: OFF };

  render() {
    const { airing, withShow } = this.props;

    if (airing.type === SERIES) {
      let episodeContent = '';
      if (airing.isEpisode) {
        episodeContent = (
          <div className="d-inline-block mr-2" style={{ width: '40px' }}>
            <Badge className="p-1" variant="dark">
              Ep. {airing.episode.number}
            </Badge>
          </div>
        );
      }

      let showTitle = '';
      if (withShow === ON) {
        showTitle = (
          <div className="text-primary d-inline-block mr-2">
            {airing.showTitle}
          </div>
        );
      }

      return (
        <div className="d-inline-block">
          <Row
            style={{
              fontSize: 'small',
              maxHeight: '24px',
              overflowY: 'auto',
              maxWidth: '55vw'
            }}
            className=""
          >
            <Col>
              {episodeContent}
              {showTitle}
              <Title title={airing.title} />
              <Description description={airing.description} />
            </Col>
          </Row>
          <Row>
            <Col>
              <span className="smaller" style={{ paddingLeft: '48px' }}>
                {airing.datetime}
              </span>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <div className="d-inline-block">
        <Row style={{ fontSize: 'small' }}>
          <Col>
            <Title title={airing.title} />
            <Description description={airing.description} />
          </Col>
        </Row>
        <Row>
          <Col>
            <span className="smaller">{airing.datetime}</span>
          </Col>
        </Row>
      </div>
    );
  }
}

function Title(prop) {
  const { title } = prop;
  if (!title) return <></>;

  return <b>{title}</b>;
}

// @flow
import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import styles from './Title.css';
import TabloImage from './TabloImage';
import Airing from '../utils/Airing';

export const viewEnum = PropTypes.oneOf('episode', 'show');
type Props = { airing: Airing, view?: viewEnum };

export default class TitleSlim extends Component<Props> {
  props: Props;

  static defaultProps: {};

  render() {
    const { airing, view } = this.props;

    if (view === 'show') {
      return (
        <Row style={{ fontSize: 'small' }}>
          <Col md="2">
            <TabloImage imageId={airing.thumbnail} maxHeight={100} />
          </Col>
          <Col md="3">
            <b>{airing.show.title}</b> &nbsp;
            <br />
            <span className="smaller">{airing.datetime}</span>
          </Col>
          <Col md="7">
            <Title title={airing.title} />
            <Description description={airing.description} />
          </Col>
        </Row>
      );
    }
    // if (view === 'episode')
    return (
      <Row style={{ fontSize: 'small' }}>
        <Col md="1">
          <Badge pill className="p-1" variant="dark">
            Ep. {airing.episode.number}
          </Badge>
        </Col>
        <Col md="3">
          <span className="smaller">{airing.datetime}</span>
        </Col>
        <Col md="8">
          <Title title={airing.title} />
          <Description description={airing.description} />
        </Col>
      </Row>
    );
  }
}
TitleSlim.defaultProps = { view: 'episode' };

function Title(prop) {
  const { title } = prop;
  if (!title) return <></>;

  return <b>{title}</b>;
}

function Description(prop) {
  const [show, setShow] = useState(false);
  const { description } = prop;

  const classes = `btn p-0 ml-1 m-0 ${styles.descBtn}`;
  const hideBtn = (
    <button
      type="button"
      title="hide"
      className={classes}
      onClick={() => setShow(false)}
    >
      <span className="fa fa-arrow-left" />
    </button>
  );

  const showBtn = (
    <button
      type="button"
      title="show description"
      className={classes}
      onClick={() => setShow(true)}
    >
      <span className="fa fa-arrow-right" />
    </button>
  );
  if (show) {
    return (
      <>
        {hideBtn} <br />
        {description}
      </>
    );
  }
  return showBtn;
}

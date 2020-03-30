// @flow
import React, { Component, useState } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import styles from './Title.css';
import Airing from '../utils/Airing';

type Props = { airing: Airing };

export default class TitleSlim extends Component<Props> {
  props: Props;

  static defaultProps: {};

  render() {
    const { airing } = this.props;

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

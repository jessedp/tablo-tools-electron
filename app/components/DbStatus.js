// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { recDbCreated } from '../utils/db';
import Build from './Build';
import RelativeDate from './RelativeDate';

type DbProps = {};
type DbState = { dbAge: number };

export default class DbStatus extends Component<DbProps, DbState> {
  timer: IntervalID;

  // TODO: figure out the type.
  buildRef: any;

  constructor() {
    super();
    this.state = { dbAge: 0 };
    this.buildRef = React.createRef();

    this.forceBuild = this.forceBuild.bind(this);
  }

  async componentDidMount() {
    this.checkAge();
    this.timer = setInterval(this.checkAge, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    return super.componentWillUnmount();
  }

  checkAge = async (forceBuild?: boolean) => {
    const created = recDbCreated();
    const dbTime = new Date(created).getTime();
    const diff = (Date.now() - dbTime) / 60 / 1000;
    this.setState({ dbAge: diff });

    const config = JSON.parse(localStorage.getItem('AppConfig') || '{}');
    if ((config.autoRebuild && diff > 30) || forceBuild) {
      await this.buildRef.build();
      this.checkAge();
    }
  };

  forceBuild = () => {
    this.checkAge(true);
  };

  render() {
    const { dbAge } = this.state;

    const created = recDbCreated();
    let color = '';
    if (dbAge < 31) {
      color = 'text-success';
    } else if (dbAge < 120) {
      color = 'text-warning';
    } else {
      color = 'text-danger';
    }

    return (
      <div className="text-muted" style={{ maxHeight: '16px' }}>
        <Row>
          <Col md="auto" className="pt-1 pr-0 mr-0">
            <Build
              view="spinner"
              showDbTable={() => {}}
              ref={buildRef => (this.buildRef = buildRef)}
            />
          </Col>
          <Col md="auto" className="pl-0 ml-0">
            <div
              style={{ cursor: 'pointer' }}
              onClick={this.forceBuild}
              onKeyDown={this.forceBuild}
              role="button"
              tabIndex="0"
              className="pl-2"
            >
              <span className={`fa fa-database pr-1 ${color}`} />

              <RelativeDate date={created} term="old" />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

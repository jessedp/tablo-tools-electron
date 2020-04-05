// @flow
import React, { Component } from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { recDbCreated } from '../utils/db';
import Build from './Build';
import RelativeDate from './RelativeDate';
import getConfig from '../utils/config';

type DbProps = {};
type DbState = { dbAge: number };

export default class DbStatus extends Component<DbProps, DbState> {
  timer: IntervalID;

  initialChecks: number;

  // TODO: figure out the type.
  buildRef: any;

  constructor() {
    super();
    this.state = { dbAge: -1 };
    this.buildRef = React.createRef();
    this.initialChecks = 0;

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
    const threshold = 15;
    // TODO: some const export?
    if (!created && this.initialChecks < threshold) {
      this.initialChecks += 1;
      clearInterval(this.timer);
      this.timer = setInterval(await this.checkAge, 1000);
      return;
    }
    if (this.initialChecks < threshold) {
      this.initialChecks = threshold;
      clearInterval(this.timer);
      this.timer = setInterval(await this.checkAge, 60000);
    }

    const dbTime = new Date(created).getTime();
    const diff = (Date.now() - dbTime) / 60 / 1000;
    this.setState({ dbAge: diff });

    const config = getConfig();
    let autoRebuild = true;
    if (Object.prototype.hasOwnProperty.call(config, 'autoRebuild')) {
      autoRebuild = config.autoRebuild;
    }

    if ((autoRebuild && diff > 30) || forceBuild) {
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
    if (dbAge === -1) {
      color = 'text-danger';
    } else if (dbAge < 31) {
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

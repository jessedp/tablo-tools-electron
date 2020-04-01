// @flow
import React, { Component } from 'react';
import Api, { checkConnection } from '../utils/Tablo';

type PingProps = {};
type PingState = { pingInd: boolean };

export default class PingStatus extends Component<PingProps, PingState> {
  timer: IntervalID;

  constructor() {
    super();
    this.state = { pingInd: false };
  }

  async componentDidMount() {
    const checkConn = async () => {
      const test = await checkConnection();
      //  console.log('conn: ', test);
      this.setState({ pingInd: test });
    };
    await checkConn();
    this.timer = setInterval(await checkConn, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    return super.componentWillUnmount();
  }

  render() {
    const { pingInd } = this.state;

    let ip = '';
    if (Api.device) {
      ip = Api.device.private_ip;
    } else {
      ip = <i>missing</i>;
    }

    let pingStatus = 'text-danger';
    if (pingInd) {
      pingStatus = 'text-success';
    }

    return (
      <>
        <span className="d-inline text-muted smaller pr-2">{ip}</span>
        <span className={`d-inline fa fa-circle ${pingStatus}`} />
      </>
    );
  }
}
